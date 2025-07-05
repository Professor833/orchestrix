"""
Django admin configuration for authentication models.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import Account, User


class AccountInline(admin.StackedInline):
    """Inline admin for Account model."""

    model = Account
    can_delete = False
    verbose_name = _("Account")
    verbose_name_plural = _("Accounts")
    fields = (
        "subscription_tier",
        "bio",
        "avatar",
        "phone_number",
        "timezone",
        "language",
        "preferences",
    )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for custom User model."""

    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_active",
        "is_staff",
        "created_at",
    )
    list_filter = ("is_active", "is_staff", "is_superuser", "created_at")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    readonly_fields = ("id", "created_at", "updated_at")
    inlines = (AccountInline,)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "created_at", "updated_at")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                ),
            },
        ),
    )

    def get_readonly_fields(self, request, obj=None):
        """Make created_at and updated_at readonly."""
        readonly_fields = super().get_readonly_fields(request, obj)
        return readonly_fields + ("created_at", "updated_at")


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    """Admin configuration for Account model."""

    list_display = (
        "user",
        "subscription_tier",
        "timezone",
        "language",
        "created_at",
    )
    list_filter = ("subscription_tier", "timezone", "language", "created_at")
    search_fields = ("user__email", "user__first_name", "user__last_name")
    ordering = ("user__email",)
    readonly_fields = ("id", "created_at", "updated_at")

    fieldsets = (
        (None, {"fields": ("user",)}),
        (_("Subscription"), {"fields": ("subscription_tier",)}),
        (_("Profile"), {"fields": ("bio", "avatar", "phone_number")}),
        (_("Preferences"), {"fields": ("timezone", "language", "preferences")}),
        (_("Important dates"), {"fields": ("created_at", "updated_at")}),
    )

    def get_readonly_fields(self, request, obj=None):
        """Make certain fields readonly."""
        readonly_fields = super().get_readonly_fields(request, obj)
        if obj:  # Editing an existing object
            return readonly_fields + ("user",)
        return readonly_fields
