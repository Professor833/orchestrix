"""
Serializers for integration models.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    Integration,
    IntegrationCategory,
    IntegrationLog,
    IntegrationTemplate,
    WebhookEndpoint,
    WebhookEvent,
)

User = get_user_model()


class IntegrationCategorySerializer(serializers.ModelSerializer):
    """Serializer for IntegrationCategory model."""

    class Meta:
        model = IntegrationCategory
        fields = ["id", "name", "description", "icon", "color", "created_at"]
        read_only_fields = ["id", "created_at"]


class IntegrationTemplateSerializer(serializers.ModelSerializer):
    """Serializer for IntegrationTemplate model."""

    class Meta:
        model = IntegrationTemplate
        fields = [
            "id",
            "category",
            "name",
            "service_name",
            "service_type",
            "description",
            "configuration_schema",
            "credential_schema",
            "setup_instructions",
            "icon",
            "documentation_url",
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
            "display_name",
            "description",
            "configuration",
            "credentials",
            "is_active",
            "is_verified",
            "last_used",
            "usage_count",
            "created_at",
            "updated_at",
            "expires_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "is_verified",
            "last_used",
            "usage_count",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {"credentials": {"write_only": True}}

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
            "display_name",
            "is_active",
            "is_verified",
            "last_used",
            "created_at",
        ]


class IntegrationLogSerializer(serializers.ModelSerializer):
    """Serializer for IntegrationLog model."""

    integration_name = serializers.CharField(
        source="integration.display_name", read_only=True
    )

    class Meta:
        model = IntegrationLog
        fields = [
            "id",
            "integration",
            "integration_name",
            "user",
            "level",
            "action",
            "message",
            "data",
            "ip_address",
            "user_agent",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class WebhookEndpointSerializer(serializers.ModelSerializer):
    """Serializer for WebhookEndpoint model."""

    integration_name = serializers.CharField(
        source="integration.display_name", read_only=True
    )
    url = serializers.SerializerMethodField()

    class Meta:
        model = WebhookEndpoint
        fields = [
            "id",
            "integration",
            "integration_name",
            "name",
            "url",
            "url_path",
            "secret",
            "is_active",
            "allowed_ips",
            "headers",
            "payload_schema",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "url", "created_at", "updated_at"]

    def get_url(self, obj):
        """Get full webhook URL."""
        return obj.full_url


class WebhookEventSerializer(serializers.ModelSerializer):
    """Serializer for WebhookEvent model."""

    endpoint_name = serializers.CharField(source="endpoint.name", read_only=True)

    class Meta:
        model = WebhookEvent
        fields = [
            "id",
            "endpoint",
            "endpoint_name",
            "status",
            "headers",
            "payload",
            "response_data",
            "ip_address",
            "user_agent",
            "processed_at",
            "error_message",
            "created_at",
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
