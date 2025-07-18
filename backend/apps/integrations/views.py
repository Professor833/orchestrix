"""
Views for integration management.
"""

from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Integration, IntegrationCategory, IntegrationLog, IntegrationTemplate, WebhookEndpoint, WebhookEvent
from .serializers import (
    IntegrationCategorySerializer,
    IntegrationListSerializer,
    IntegrationLogSerializer,
    IntegrationSerializer,
    IntegrationSyncSerializer,
    IntegrationTemplateSerializer,
    IntegrationTestSerializer,
    WebhookEndpointSerializer,
    WebhookEventSerializer,
)


class IntegrationCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for integration categories (read-only)."""

    serializer_class = IntegrationCategorySerializer
    permission_classes = [IsAuthenticated]
    queryset = IntegrationCategory.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
    pagination_class = None


class IntegrationTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for integration templates (read-only)."""

    serializer_class = IntegrationTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["category", "service_name", "service_type", "is_active"]
    search_fields = ["name", "service_name", "description"]
    ordering_fields = ["name", "service_name", "created_at"]
    ordering = ["name"]
    pagination_class = None

    def get_queryset(self):
        """Get active templates."""
        return IntegrationTemplate.objects.filter(is_active=True).select_related("category")

    @action(detail=True, methods=["post"])
    def create_integration(self, request, pk=None):
        """Create integration from template."""
        template = self.get_object()

        # Get the data from request
        display_name = request.data.get("display_name", template.name)
        configuration = request.data.get("configuration", {})

        # Extract credentials from configuration
        credentials = configuration.pop("credentials", {})

        # Create the integration
        integration = Integration.objects.create(
            user=request.user,
            category=template.category,
            service_name=template.service_name,
            service_type=template.service_type,
            display_name=display_name,
            description=request.data.get("description", template.description),
            credentials=credentials,
            configuration=configuration,
        )

        # Log the creation
        IntegrationLog.objects.create(
            integration=integration,
            user=request.user,
            level="info",
            action="created",
            message=f"Integration created from template: {template.name}",
            data={"template_id": str(template.id)},
        )

        serializer = IntegrationSerializer(integration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class IntegrationViewSet(viewsets.ModelViewSet):
    """ViewSet for integrations."""

    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = [
        "category",
        "service_name",
        "service_type",
        "is_active",
        "is_verified",
    ]
    search_fields = ["display_name", "service_name", "description"]
    ordering_fields = ["display_name", "service_name", "created_at", "last_used"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Get integrations for the current user."""
        return Integration.objects.filter(user=self.request.user).select_related("category")

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return IntegrationListSerializer
        return IntegrationSerializer

    @action(detail=True, methods=["post"])
    def test_connection(self, request, pk=None):
        """Test integration connection."""
        integration = self.get_object()

        serializer = IntegrationTestSerializer(data={}, context={"integration": integration})

        if serializer.is_valid():
            # Update integration verification status
            integration.is_verified = True
            integration.save(update_fields=["is_verified"])

            # Log the test
            IntegrationLog.objects.create(
                integration=integration,
                user=request.user,
                level="info",
                action="verified",
                message="Integration connection test successful",
                data=serializer.validated_data,
            )

            return Response(serializer.validated_data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def sync(self, request, pk=None):
        """Sync integration data."""
        integration = self.get_object()

        serializer = IntegrationSyncSerializer(data=request.data, context={"integration": integration})

        if serializer.is_valid():
            # Update last used time
            integration.last_used = timezone.now()
            integration.save(update_fields=["last_used"])

            # Log the sync
            IntegrationLog.objects.create(
                integration=integration,
                user=request.user,
                level="info",
                action="sync",
                message="Integration sync started",
                data=serializer.validated_data,
            )

            return Response(serializer.validated_data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["patch"])
    def toggle_status(self, request, pk=None):
        """Toggle integration active status."""
        integration = self.get_object()
        integration.is_active = not integration.is_active
        integration.save(update_fields=["is_active"])

        serializer = self.get_serializer(integration)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def logs(self, request, pk=None):
        """Get integration logs."""
        integration = self.get_object()

        logs = IntegrationLog.objects.filter(integration=integration).order_by("-created_at")

        # Pagination
        page = self.paginate_queryset(logs)
        if page is not None:
            serializer = IntegrationLogSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = IntegrationLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def webhooks(self, request, pk=None):
        """Get webhook endpoints for this integration."""
        integration = self.get_object()

        webhooks = WebhookEndpoint.objects.filter(integration=integration)
        serializer = WebhookEndpointSerializer(webhooks, many=True)
        return Response(serializer.data)


class IntegrationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for integration logs (read-only)."""

    serializer_class = IntegrationLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["integration", "action", "level"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Get logs for integrations owned by the current user."""
        return IntegrationLog.objects.filter(integration__user=self.request.user).select_related("integration")


class WebhookEndpointViewSet(viewsets.ModelViewSet):
    """ViewSet for webhook endpoints."""

    serializer_class = WebhookEndpointSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["integration", "is_active"]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Get webhook endpoints for integrations owned by the current user."""
        return WebhookEndpoint.objects.filter(integration__user=self.request.user).select_related("integration")

    def perform_create(self, serializer):
        """Ensure user owns the integration."""
        integration = serializer.validated_data["integration"]
        if integration.user != self.request.user:
            raise PermissionError("You don't have permission to create webhooks for this integration.")
        serializer.save()

    @action(detail=True, methods=["post"])
    def regenerate_secret(self, request, pk=None):
        """Regenerate webhook secret key."""
        webhook = self.get_object()

        import hashlib
        import uuid

        # Generate new secret key
        new_secret = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()
        webhook.secret = new_secret
        webhook.save(update_fields=["secret"])

        serializer = self.get_serializer(webhook)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def events(self, request, pk=None):
        """Get webhook events for this endpoint."""
        webhook = self.get_object()

        events = WebhookEvent.objects.filter(endpoint=webhook).order_by("-created_at")

        # Pagination
        page = self.paginate_queryset(events)
        if page is not None:
            serializer = WebhookEventSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = WebhookEventSerializer(events, many=True)
        return Response(serializer.data)


class WebhookEventViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for webhook events (read-only)."""

    serializer_class = WebhookEventSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["endpoint", "status"]
    ordering_fields = ["created_at", "processed_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Get webhook events for endpoints owned by the current user."""
        return WebhookEvent.objects.filter(endpoint__integration__user=self.request.user).select_related("endpoint")
