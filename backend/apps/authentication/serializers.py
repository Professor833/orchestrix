"""
Authentication serializers for user registration, login, and profile management.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework import serializers

from .models import Account, User


# Signal to create Account when User is created
@receiver(post_save, sender=User)
def create_user_account(sender, instance, created, **kwargs):
    """Create Account when User is created."""
    if created:
        Account.objects.create(user=instance)


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "password", "password_confirm")
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        """Create a new user."""
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Validate user credentials."""
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(
                request=self.context.get("request"), username=email, password=password
            )

            if not user:
                raise serializers.ValidationError("Invalid email or password.")

            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")

            attrs["user"] = user
            return attrs

        raise serializers.ValidationError("Must provide email and password.")


class AccountSerializer(serializers.ModelSerializer):
    """Serializer for Account model."""

    class Meta:
        model = Account
        fields = (
            "id",
            "preferences",
            "subscription_tier",
            "bio",
            "avatar",
            "phone_number",
            "timezone",
            "language",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_preferences(self, value):
        """Validate user preferences."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Preferences must be a dictionary.")
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""

    full_name = serializers.CharField(source="get_full_name", read_only=True)
    account = AccountSerializer(read_only=True)
    is_premium = serializers.SerializerMethodField()
    api_rate_limit = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "account",
            "is_premium",
            "api_rate_limit",
            "created_at",
        )
        read_only_fields = ("id", "email", "created_at")

    def get_is_premium(self, obj):
        """Get premium status from account."""
        return obj.account.is_premium if hasattr(obj, "account") else False

    def get_api_rate_limit(self, obj):
        """Get API rate limit from account."""
        return obj.account.api_rate_limit if hasattr(obj, "account") else 100

    def update(self, instance, validated_data):
        """Update user profile."""
        # Extract account data if provided
        account_data = self.context.get("account_data", {})

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update account fields if provided
        if account_data and hasattr(instance, "account"):
            account_serializer = AccountSerializer(
                instance.account, data=account_data, partial=True
            )
            if account_serializer.is_valid():
                account_serializer.save()

        return instance


class UserAccountUpdateSerializer(serializers.Serializer):
    """Serializer for updating user and account data together."""

    # User fields
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)

    # Account fields
    bio = serializers.CharField(max_length=500, required=False, allow_blank=True)
    avatar = serializers.URLField(required=False, allow_blank=True)
    phone_number = serializers.CharField(
        max_length=20, required=False, allow_blank=True
    )
    timezone = serializers.CharField(max_length=50, required=False)
    language = serializers.CharField(max_length=10, required=False)
    preferences = serializers.JSONField(required=False)

    def validate_preferences(self, value):
        """Validate user preferences."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Preferences must be a dictionary.")
        return value

    def update(self, instance, validated_data):
        """Update user and account data."""
        # Separate user and account data
        user_fields = ["first_name", "last_name"]
        account_fields = [
            "bio",
            "avatar",
            "phone_number",
            "timezone",
            "language",
            "preferences",
        ]

        user_data = {k: v for k, v in validated_data.items() if k in user_fields}
        account_data = {k: v for k, v in validated_data.items() if k in account_fields}

        # Update user fields
        for attr, value in user_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update account fields
        if account_data and hasattr(instance, "account"):
            account_serializer = AccountSerializer(
                instance.account, data=account_data, partial=True
            )
            if account_serializer.is_valid():
                account_serializer.save()

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Validate password change."""
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "New passwords do not match."}
            )
        return attrs

    def validate_old_password(self, value):
        """Validate old password."""
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Invalid old password.")
        return value

    def save(self, **kwargs):
        """Save new password."""
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for other apps."""

    full_name = serializers.CharField(source="get_full_name", read_only=True)
    account = AccountSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "full_name", "account")
        read_only_fields = ("id", "email")
