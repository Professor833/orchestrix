"""
Views for integration management.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone

from .models import (
    Integration,
    IntegrationCategory,
    IntegrationTemplate,
    IntegrationLog,
    WebhookEndpoint,
    WebhookEvent,
)
from .serializers import (
    IntegrationSerializer,
    IntegrationListSerializer,
    IntegrationCategorySerializer,
    IntegrationTemplateSerializer,
    IntegrationLogSerializer,
    WebhookEndpointSerializer,
    WebhookEventSerializer,
    IntegrationTestSerializer,
    IntegrationSyncSerializer,
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


class IntegrationTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for integration templates (read-only)."""

    serializer_class = IntegrationTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["category", "service_name", "auth_type", "is_active"]
    search_fields = ["name", "service_name", "description"]
    ordering_fields = ["name", "service_name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        """Get active templates."""
        return IntegrationTemplate.objects.filter(is_active=True).select_related(
            "category"
        )


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
    search_fields = ["name", "service_name", "description"]
    ordering_fields = ["name", "service_name", "created_at", "last_sync"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Get integrations for the current user."""
        return Integration.objects.filter(user=self.request.user).select_related(
            "category"
        )

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return IntegrationListSerializer
        return IntegrationSerializer

    @action(detail=True, methods=["post"])
    def test_connection(self, request, pk=None):
        """Test integration connection."""
        integration = self.get_object()

        serializer = IntegrationTestSerializer(
            data={}, context={"integration": integration}
        )

        if serializer.is_valid():
            # Update integration verification status
            integration.is_verified = True
            integration.save(update_fields=["is_verified"])

            # Log the test
            IntegrationLog.objects.create(
                integration=integration,
                action="test_connection",
                status="success",
                request_data={},
                response_data=serializer.validated_data,
            )

            return Response(serializer.validated_data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def sync(self, request, pk=None):
        """Sync integration data."""
        integration = self.get_object()

        serializer = IntegrationSyncSerializer(
            data=request.data, context={"integration": integration}
        )

        if serializer.is_valid():
            # Update last sync time
            integration.last_sync = timezone.now()
            integration.save(update_fields=["last_sync"])

            # Log the sync
            IntegrationLog.objects.create(
                integration=integration,
                action="sync",
                status="success",
                request_data=request.data,
                response_data=serializer.validated_data,
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

        logs = IntegrationLog.objects.filter(integration=integration).order_by(
            "-created_at"
        )

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
    filterset_fields = ["integration", "action", "status"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Get logs for integrations owned by the current user."""
        return IntegrationLog.objects.filter(
            integration__user=self.request.user
        ).select_related("integration")


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
        return WebhookEndpoint.objects.filter(
            integration__user=self.request.user
        ).select_related("integration")

    def perform_create(self, serializer):
        """Ensure user owns the integration."""
        integration = serializer.validated_data["integration"]
        if integration.user != self.request.user:
            raise PermissionError(
                "You don't have permission to create webhooks for this integration."
            )
        serializer.save()

    @action(detail=True, methods=["post"])
    def regenerate_secret(self, request, pk=None):
        """Regenerate webhook secret key."""
        webhook = self.get_object()

        import hashlib
        import uuid

        # Generate new secret key
        new_secret = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()
        webhook.secret_key = new_secret
        webhook.save(update_fields=["secret_key"])

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
    filterset_fields = ["endpoint", "event_type", "processed"]
    ordering_fields = ["created_at", "processed_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Get webhook events for endpoints owned by the current user."""
        return WebhookEvent.objects.filter(
            endpoint__integration__user=self.request.user
        ).select_related("endpoint")
