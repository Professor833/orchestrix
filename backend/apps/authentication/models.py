"""
Authentication models for user management.
"""

import uuid

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError(_("The Email field must be set"))

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model with email as username field."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_("email address"), unique=True)
    username = None  # Remove username field
    first_name = models.CharField(_("first name"), max_length=150)
    last_name = models.CharField(_("last name"), max_length=150)
    is_active = models.BooleanField(
        _("active"),
        default=True,  # type: ignore
        help_text=_(  # type: ignore
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        db_table = "auth_users"

    def __str__(self):
        return self.email

    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = f"{self.first_name} {self.last_name}"
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name


class Account(models.Model):
    """Account model with 1-to-1 relationship to User model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="account", verbose_name=_("User")
    )
    preferences = models.JSONField(
        _("user preferences"),
        default=dict,
        blank=True,
        help_text=_("User-specific preferences and settings"),
    )
    subscription_tier = models.CharField(
        _("subscription tier"),
        max_length=20,
        choices=[
            ("free", _("Free")),
            ("premium", _("Premium")),
            ("enterprise", _("Enterprise")),
        ],
        default="free",
        help_text=_("User subscription tier"),
    )
    bio = models.TextField(
        _("bio"),
        blank=True,
        max_length=500,
        help_text=_("User biography"),
    )
    avatar = models.URLField(
        _("avatar"),
        blank=True,
        help_text=_("User avatar URL"),
    )
    phone_number = models.CharField(
        _("phone number"),
        max_length=20,
        blank=True,
        help_text=_("User phone number"),
    )
    timezone = models.CharField(
        _("timezone"),
        max_length=50,
        default="UTC",
        help_text=_("User timezone"),
    )
    language = models.CharField(
        _("language"),
        max_length=10,
        default="en",
        help_text=_("User preferred language"),
    )
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("Account")
        verbose_name_plural = _("Accounts")
        db_table = "auth_accounts"

    def __str__(self):
        return f"{self.user.email} - Account"  # type: ignore

    @property
    def is_premium(self):
        """Check if user has premium subscription."""
        return self.subscription_tier in ["premium", "enterprise"]

    @property
    def api_rate_limit(self):
        """Get API rate limit based on subscription."""
        if self.subscription_tier == "enterprise":
            return 10000  # requests per hour
        elif self.subscription_tier == "premium":
            return 1000  # requests per hour
        return 100  # requests per hour for free users

    def get_preference(self, key, default=None):
        """Get a specific preference value."""
        return self.preferences.get(key, default) if self.preferences else default  # type: ignore

    def set_preference(self, key, value):
        """Set a specific preference value."""
        if not self.preferences:
            self.preferences = {}
        self.preferences[key] = value  # type: ignore
        self.save(update_fields=["preferences", "updated_at"])
