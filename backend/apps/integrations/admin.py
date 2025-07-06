"""
Django admin configuration for integration models.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from .models import (
    Integration,
    IntegrationCategory,
    IntegrationLog,
    IntegrationTemplate,
    WebhookEndpoint,
    WebhookEvent,
)


@admin.register(IntegrationCategory)
class IntegrationCategoryAdmin(admin.ModelAdmin):
    """Admin configuration for IntegrationCategory model."""

    list_display = ["name", "icon", "color_display", "created_at"]
    search_fields = ["name", "description"]
    readonly_fields = ["id", "created_at"]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "name",
                    "description",
                    "icon",
                    "color",
                )
            },
        ),
        (
            _("Timestamps"),
            {
                "fields": ("created_at",),
                "classes": ("collapse",),
            },
        ),
    )
    ordering = ["name"]

    def color_display(self, obj):
        """Display color as a colored box."""
        return format_html(
            '<div style="width: 20px; height: 20px; background-color: {}; border: 1px solid #ccc;"></div>',
            obj.color,
        )

    color_display.short_description = _("Color")


class IntegrationLogInline(admin.TabularInline):
    """Inline admin for IntegrationLog model."""

    model = IntegrationLog
    extra = 0
    fields = ["level", "action", "message", "created_at"]
    readonly_fields = ["created_at"]
    show_change_link = True


class WebhookEndpointInline(admin.TabularInline):
    """Inline admin for WebhookEndpoint model."""

    model = WebhookEndpoint
    extra = 0
    fields = ["name", "url_path", "is_active", "created_at"]
    readonly_fields = ["created_at"]
    show_change_link = True


@admin.register(Integration)
class IntegrationAdmin(admin.ModelAdmin):
    """Admin configuration for Integration model."""

    list_display = [
        "service_name",
        "user",
        "service_type",
        "is_active",
        "is_verified",
        "usage_count",
        "last_used",
        "expires_display",
    ]
    list_filter = ["service_type", "is_active", "is_verified", "created_at"]
    search_fields = ["service_name", "display_name", "user__email"]
    readonly_fields = [
        "id",
        "usage_count",
        "last_used",
        "expires_display",
        "is_expired_display",
        "created_at",
        "updated_at",
    ]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "user",
                    "category",
                    "service_name",
                    "service_type",
                    "display_name",
                    "description",
                )
            },
        ),
        (
            _("Status"),
            {
                "fields": (
                    "is_active",
                    "is_verified",
                    "expires_at",
                    "expires_display",
                    "is_expired_display",
                ),
            },
        ),
        (
            _("Configuration"),
            {
                "fields": ("credentials", "configuration"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Usage Statistics"),
            {
                "fields": ("usage_count", "last_used"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Timestamps"),
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )
    inlines = [IntegrationLogInline, WebhookEndpointInline]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related("user", "category")

    def expires_display(self, obj):
        """Display expiration date with status."""
        if obj.expires_at:
            if obj.is_expired:
                return format_html('<span style="color: red;">🔴 {}</span>', obj.expires_at)
            else:
                return format_html('<span style="color: green;">🟢 {}</span>', obj.expires_at)
        return _("Never expires")

    expires_display.short_description = _("Expires")

    def is_expired_display(self, obj):
        """Display if integration is expired."""
        return "❌" if obj.is_expired else "✅"

    is_expired_display.short_description = _("Is Expired")
    is_expired_display.boolean = True


@admin.register(IntegrationTemplate)
class IntegrationTemplateAdmin(admin.ModelAdmin):
    """Admin configuration for IntegrationTemplate model."""

    list_display = [
        "name",
        "service_name",
        "service_type",
        "is_active",
        "created_at",
    ]
    list_filter = ["service_type", "is_active", "created_at"]
    search_fields = ["name", "service_name", "description"]
    readonly_fields = ["id", "created_at", "updated_at"]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "name",
                    "service_name",
                    "service_type",
                    "description",
                    "is_active",
                )
            },
        ),
        (
            _("Configuration"),
            {
                "fields": ("configuration_schema", "credential_schema"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Documentation"),
            {
                "fields": ("setup_instructions", "documentation_url", "icon"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Timestamps"),
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )
    ordering = ["name"]


@admin.register(IntegrationLog)
class IntegrationLogAdmin(admin.ModelAdmin):
    """Admin configuration for IntegrationLog model."""

    list_display = [
        "integration",
        "user",
        "level",
        "action",
        "message_short",
        "created_at",
    ]
    list_filter = ["level", "action", "created_at"]
    search_fields = ["integration__service_name", "user__email", "message"]
    readonly_fields = ["id", "created_at"]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "integration",
                    "user",
                    "level",
                    "action",
                )
            },
        ),
        (
            _("Log Details"),
            {
                "fields": ("message", "data"),
            },
        ),
        (
            _("Request Information"),
            {
                "fields": ("ip_address", "user_agent"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Timestamps"),
            {
                "fields": ("created_at",),
                "classes": ("collapse",),
            },
        ),
    )
    ordering = ["-created_at"]
    date_hierarchy = "created_at"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related("integration", "user")

    def message_short(self, obj):
        """Display shortened message."""
        if len(obj.message) > 50:
            return f"{obj.message[:50]}..."
        return obj.message

    message_short.short_description = _("Message")


class WebhookEventInline(admin.TabularInline):
    """Inline admin for WebhookEvent model."""

    model = WebhookEvent
    extra = 0
    fields = ["status", "ip_address", "created_at", "processed_at"]
    readonly_fields = ["created_at", "processed_at"]
    show_change_link = True


@admin.register(WebhookEndpoint)
class WebhookEndpointAdmin(admin.ModelAdmin):
    """Admin configuration for WebhookEndpoint model."""

    list_display = [
        "name",
        "integration",
        "url_path_display",
        "is_active",
        "events_count",
        "created_at",
    ]
    list_filter = ["is_active", "created_at"]
    search_fields = ["name", "url_path", "integration__service_name"]
    readonly_fields = [
        "id",
        "full_url_display",
        "events_count",
        "created_at",
        "updated_at",
    ]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "integration",
                    "name",
                    "url_path",
                    "full_url_display",
                    "is_active",
                )
            },
        ),
        (
            _("Security"),
            {
                "fields": ("secret", "allowed_ips", "headers"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Configuration"),
            {
                "fields": ("payload_schema",),
                "classes": ("collapse",),
            },
        ),
        (
            _("Statistics"),
            {
                "fields": ("events_count",),
                "classes": ("collapse",),
            },
        ),
        (
            _("Timestamps"),
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )
    inlines = [WebhookEventInline]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related("integration")

    def url_path_display(self, obj):
        """Display URL path with copy button."""
        return format_html(
            '<code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">{}</code>',
            obj.url_path,
        )

    url_path_display.short_description = _("URL Path")

    def full_url_display(self, obj):
        """Display full webhook URL."""
        try:
            full_url = obj.full_url
            return format_html(
                '<a href="{}" target="_blank">{}</a>',
                full_url,
                full_url,
            )
        except Exception:
            return _("URL not available")

    full_url_display.short_description = _("Full URL")

    def events_count(self, obj):
        """Display events count."""
        return obj.events.count()

    events_count.short_description = _("Events Count")


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    """Admin configuration for WebhookEvent model."""

    list_display = [
        "endpoint",
        "status",
        "ip_address",
        "user_agent_short",
        "created_at",
        "processed_at",
    ]
    list_filter = ["status", "created_at", "processed_at"]
    search_fields = ["endpoint__name", "ip_address", "user_agent"]
    readonly_fields = [
        "id",
        "endpoint",
        "headers",
        "payload",
        "response_data",
        "ip_address",
        "user_agent",
        "created_at",
        "processed_at",
    ]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "endpoint",
                    "status",
                    "processed_at",
                )
            },
        ),
        (
            _("Request Data"),
            {
                "fields": ("headers", "payload"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Response Data"),
            {
                "fields": ("response_data",),
                "classes": ("collapse",),
            },
        ),
        (
            _("Client Information"),
            {
                "fields": ("ip_address", "user_agent"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Error Information"),
            {
                "fields": ("error_message",),
                "classes": ("collapse",),
            },
        ),
        (
            _("Timestamps"),
            {
                "fields": ("created_at",),
                "classes": ("collapse",),
            },
        ),
    )
    ordering = ["-created_at"]
    date_hierarchy = "created_at"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related("endpoint")

    def user_agent_short(self, obj):
        """Display shortened user agent."""
        if obj.user_agent and len(obj.user_agent) > 30:
            return f"{obj.user_agent[:30]}..."
        return obj.user_agent or _("Unknown")

    user_agent_short.short_description = _("User Agent")
