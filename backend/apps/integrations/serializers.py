"""
Serializers for integration models.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Integration,
    IntegrationCategory,
    IntegrationTemplate,
    IntegrationLog,
    WebhookEndpoint,
    WebhookEvent,
)

User = get_user_model()


class IntegrationCategorySerializer(serializers.ModelSerializer):
    """Serializer for IntegrationCategory model."""

    class Meta:
        model = IntegrationCategory
        fields = ["id", "name", "description", "icon", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class IntegrationTemplateSerializer(serializers.ModelSerializer):
    """Serializer for IntegrationTemplate model."""

    class Meta:
        model = IntegrationTemplate
        fields = [
            "id",
            "category",
            "name",
            "service_name",
            "description",
            "config_schema",
            "auth_type",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class IntegrationSerializer(serializers.ModelSerializer):
    """Serializer for Integration model."""

    category_name = serializers.CharField(source="category.name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Integration
        fields = [
            "id",
            "user",
            "user_email",
            "category",
            "category_name",
            "service_name",
            "service_type",
            "name",
            "description",
            "configuration",
            "is_active",
            "is_verified",
            "last_sync",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "is_verified",
            "last_sync",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        """Create integration with user from context."""
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class IntegrationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for integration lists."""

    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Integration
        fields = [
            "id",
            "category_name",
            "service_name",
            "name",
            "is_active",
            "is_verified",
            "last_sync",
            "created_at",
        ]


class IntegrationLogSerializer(serializers.ModelSerializer):
    """Serializer for IntegrationLog model."""

    integration_name = serializers.CharField(source="integration.name", read_only=True)

    class Meta:
        model = IntegrationLog
        fields = [
            "id",
            "integration",
            "integration_name",
            "action",
            "status",
            "request_data",
            "response_data",
            "error_message",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class WebhookEndpointSerializer(serializers.ModelSerializer):
    """Serializer for WebhookEndpoint model."""

    integration_name = serializers.CharField(source="integration.name", read_only=True)

    class Meta:
        model = WebhookEndpoint
        fields = [
            "id",
            "integration",
            "integration_name",
            "name",
            "url",
            "secret_key",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "url", "secret_key", "created_at", "updated_at"]

    def create(self, validated_data):
        """Create webhook endpoint with generated URL and secret."""
        import uuid
        import hashlib

        # Generate unique URL path
        url_path = str(uuid.uuid4())
        validated_data["url"] = f"/api/webhooks/{url_path}/"

        # Generate secret key
        secret_key = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()
        validated_data["secret_key"] = secret_key

        return super().create(validated_data)


class WebhookEventSerializer(serializers.ModelSerializer):
    """Serializer for WebhookEvent model."""

    endpoint_name = serializers.CharField(source="endpoint.name", read_only=True)

    class Meta:
        model = WebhookEvent
        fields = [
            "id",
            "endpoint",
            "endpoint_name",
            "event_type",
            "payload",
            "headers",
            "processed",
            "created_at",
            "processed_at",
        ]
        read_only_fields = ["id", "created_at", "processed_at"]


class IntegrationTestSerializer(serializers.Serializer):
    """Serializer for testing integration connections."""

    def validate(self, data):
        """Test the integration connection."""
        integration = self.context["integration"]

        # Here you would implement actual connection testing logic
        # For now, we'll just return success
        return {
            "success": True,
            "message": "Integration connection test successful",
            "details": {"service": integration.service_name, "status": "connected"},
        }


class IntegrationSyncSerializer(serializers.Serializer):
    """Serializer for syncing integration data."""

    sync_type = serializers.ChoiceField(
        choices=["full", "incremental"], default="incremental"
    )

    def validate(self, data):
        """Trigger integration sync."""
        integration = self.context["integration"]

        # Here you would implement actual sync logic
        # For now, we'll just return success
        return {
            "success": True,
            "message": f"Integration sync started for {integration.name}",
            "sync_type": data["sync_type"],
            "started_at": integration.last_sync,
        }
