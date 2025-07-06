"""
Integration models for external service connections and API integrations.
"""

import base64
import uuid

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class IntegrationCategory(models.Model):
    """Categories for organizing integrations."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_("name"), max_length=100, unique=True)
    description = models.TextField(_("description"), blank=True)
    icon = models.CharField(_("icon"), max_length=100, blank=True)
    color = models.CharField(_("color"), max_length=7, default="#3B82F6")
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)

    class Meta:
        verbose_name = _("Integration Category")
        verbose_name_plural = _("Integration Categories")
        db_table = "integration_categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Integration(models.Model):
    """External service integrations."""

    SERVICE_TYPE_CHOICES = [
        ("ai", _("AI Service")),
        ("api", _("REST API")),
        ("webhook", _("Webhook")),
        ("oauth", _("OAuth Service")),
        ("database", _("Database")),
        ("email", _("Email Service")),
        ("sms", _("SMS Service")),
        ("notification", _("Notification Service")),
        ("file_storage", _("File Storage")),
        ("analytics", _("Analytics")),
        ("other", _("Other")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="integrations"
    )
    category = models.ForeignKey(
        IntegrationCategory, on_delete=models.SET_NULL, null=True, blank=True
    )
    service_name = models.CharField(_("service name"), max_length=100)
    service_type = models.CharField(
        _("service type"), max_length=20, choices=SERVICE_TYPE_CHOICES
    )
    display_name = models.CharField(_("display name"), max_length=200, blank=True)
    description = models.TextField(_("description"), blank=True)
    credentials = models.JSONField(_("credentials"), default=dict)
    configuration = models.JSONField(_("configuration"), default=dict)
    is_active = models.BooleanField(_("is active"), default=True)
    is_verified = models.BooleanField(_("is verified"), default=False)
    last_used = models.DateTimeField(_("last used"), null=True, blank=True)
    usage_count = models.PositiveIntegerField(_("usage count"), default=0)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)
    expires_at = models.DateTimeField(_("expires at"), null=True, blank=True)

    class Meta:
        verbose_name = _("Integration")
        verbose_name_plural = _("Integrations")
        db_table = "integrations"
        ordering = ["-created_at"]
        unique_together = ["user", "service_name", "display_name"]
        indexes = [
            models.Index(fields=["user", "service_type"]),
            models.Index(fields=["service_name", "is_active"]),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.display_name or self.service_name}"

    def save(self, *args, **kwargs):
        """Override save to encrypt credentials."""
        if self.credentials:
            self.credentials = self._encrypt_credentials(self.credentials)
        super().save(*args, **kwargs)

    def _encrypt_credentials(self, credentials):
        """Encrypt sensitive credentials."""
        if not credentials:
            return {}

        # Generate a key for encryption (in production, use proper key management)
        key = settings.SECRET_KEY.encode()[:32]  # Use first 32 chars of secret key
        key = base64.urlsafe_b64encode(key.ljust(32, b"0"))
        f = Fernet(key)

        encrypted_creds = {}
        for key_name, value in credentials.items():
            if key_name.lower() in ["password", "secret", "token", "key", "api_key"]:
                if isinstance(value, str):
                    encrypted_creds[key_name] = f.encrypt(value.encode()).decode()
                else:
                    encrypted_creds[key_name] = value
            else:
                encrypted_creds[key_name] = value

        return encrypted_creds

    def get_decrypted_credentials(self):
        """Decrypt and return credentials."""
        if not self.credentials:
            return {}

        key = settings.SECRET_KEY.encode()[:32]
        key = base64.urlsafe_b64encode(key.ljust(32, b"0"))
        f = Fernet(key)

        decrypted_creds = {}
        for key_name, value in self.credentials.items():
            if key_name.lower() in ["password", "secret", "token", "key", "api_key"]:
                if isinstance(value, str):
                    try:
                        decrypted_creds[key_name] = f.decrypt(value.encode()).decode()
                    except InvalidToken:
                        decrypted_creds[key_name] = (
                            value  # If decryption fails, return as-is
                        )
                else:
                    decrypted_creds[key_name] = value
            else:
                decrypted_creds[key_name] = value

        return decrypted_creds

    @property
    def is_expired(self):
        """Check if integration has expired."""
        if self.expires_at:
            from django.utils import timezone

            return timezone.now() > self.expires_at
        return False

    def increment_usage(self):
        """Increment usage count."""
        from django.utils import timezone

        self.usage_count += 1
        self.last_used = timezone.now()
        self.save()


class IntegrationTemplate(models.Model):
    """Templates for common integrations."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_("name"), max_length=100)
    category = models.ForeignKey(
        IntegrationCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="templates",
    )
    service_name = models.CharField(_("service name"), max_length=100)
    service_type = models.CharField(_("service type"), max_length=20)
    description = models.TextField(_("description"))
    configuration_schema = models.JSONField(_("configuration schema"), default=dict)
    credential_schema = models.JSONField(_("credential schema"), default=dict)
    setup_instructions = models.TextField(_("setup instructions"), blank=True)
    icon = models.CharField(_("icon"), max_length=100, blank=True)
    documentation_url = models.URLField(_("documentation URL"), blank=True)
    is_active = models.BooleanField(_("is active"), default=True)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("Integration Template")
        verbose_name_plural = _("Integration Templates")
        db_table = "integration_templates"
        ordering = ["name"]

    def __str__(self):
        return self.name


class IntegrationLog(models.Model):
    """Logs for integration activities."""

    LOG_LEVEL_CHOICES = [
        ("debug", _("Debug")),
        ("info", _("Info")),
        ("warning", _("Warning")),
        ("error", _("Error")),
        ("critical", _("Critical")),
    ]

    ACTION_CHOICES = [
        ("created", _("Created")),
        ("updated", _("Updated")),
        ("deleted", _("Deleted")),
        ("verified", _("Verified")),
        ("used", _("Used")),
        ("failed", _("Failed")),
        ("expired", _("Expired")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    integration = models.ForeignKey(
        Integration, on_delete=models.CASCADE, related_name="logs"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="integration_logs"
    )
    level = models.CharField(
        _("level"), max_length=20, choices=LOG_LEVEL_CHOICES, default="info"
    )
    action = models.CharField(_("action"), max_length=20, choices=ACTION_CHOICES)
    message = models.TextField(_("message"))
    data = models.JSONField(_("data"), default=dict)
    ip_address = models.GenericIPAddressField(_("IP address"), null=True, blank=True)
    user_agent = models.TextField(_("user agent"), blank=True)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)

    class Meta:
        verbose_name = _("Integration Log")
        verbose_name_plural = _("Integration Logs")
        db_table = "integration_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["integration", "level"]),
            models.Index(fields=["user", "created_at"]),
        ]

    def __str__(self):
        return f"{self.integration.service_name} - {self.action} - {self.level}"


class WebhookEndpoint(models.Model):
    """Webhook endpoints for receiving external triggers."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    integration = models.ForeignKey(
        Integration, on_delete=models.CASCADE, related_name="webhook_endpoints"
    )
    name = models.CharField(_("name"), max_length=100)
    url_path = models.CharField(_("URL path"), max_length=200, unique=True)
    secret = models.CharField(_("secret"), max_length=100, blank=True)
    is_active = models.BooleanField(_("is active"), default=True)
    allowed_ips = models.JSONField(_("allowed IPs"), default=list)
    headers = models.JSONField(_("required headers"), default=dict)
    payload_schema = models.JSONField(_("payload schema"), default=dict)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("Webhook Endpoint")
        verbose_name_plural = _("Webhook Endpoints")
        db_table = "webhook_endpoints"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.integration.service_name} - {self.name}"

    @property
    def full_url(self):
        """Get the full webhook URL."""
        from django.urls import reverse

        return reverse("webhook_handler", kwargs={"path": self.url_path})


class WebhookEvent(models.Model):
    """Received webhook events."""

    STATUS_CHOICES = [
        ("received", _("Received")),
        ("processed", _("Processed")),
        ("failed", _("Failed")),
        ("ignored", _("Ignored")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    endpoint = models.ForeignKey(
        WebhookEndpoint, on_delete=models.CASCADE, related_name="events"
    )
    status = models.CharField(
        _("status"), max_length=20, choices=STATUS_CHOICES, default="received"
    )
    headers = models.JSONField(_("headers"), default=dict)
    payload = models.JSONField(_("payload"), default=dict)
    response_data = models.JSONField(_("response data"), default=dict)
    ip_address = models.GenericIPAddressField(_("IP address"), null=True, blank=True)
    user_agent = models.TextField(_("user agent"), blank=True)
    processed_at = models.DateTimeField(_("processed at"), null=True, blank=True)
    error_message = models.TextField(_("error message"), blank=True)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)

    class Meta:
        verbose_name = _("Webhook Event")
        verbose_name_plural = _("Webhook Events")
        db_table = "webhook_events"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["endpoint", "status"]),
            models.Index(fields=["status", "created_at"]),
        ]

    def __str__(self):
        return f"{self.endpoint.name} - {self.status} - {self.created_at}"
