from django.utils.decorators import method_decorator
from django.utils.translation import gettext_lazy as _

from django_ratelimit.decorators import ratelimit
from rest_framework import permissions, status
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    ChangePasswordSerializer,
    UserAccountUpdateSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)


class UserRegistrationView(APIView):
    """User registration endpoint."""

    permission_classes = [permissions.AllowAny]

    @method_decorator(ratelimit(key="ip", rate="5/m", method="POST", block=True))
    def post(self, request):
        """Register a new user."""
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            # Return user data with tokens
            user_data = UserSerializer(user).data

            return Response(
                {
                    "message": _("User registered successfully"),
                    "user": user_data,
                    "tokens": {
                        "access": str(access_token),
                        "refresh": str(refresh),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(TokenObtainPairView):
    """User login endpoint with custom serializer."""

    permission_classes = [permissions.AllowAny]

    @method_decorator(ratelimit(key="ip", rate="10/m", method="POST", block=True))
    def post(self, request, *args, **kwargs):
        """Login user with email and password."""
        serializer = UserLoginSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            user = serializer.validated_data["user"]

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            # Return user data with tokens
            user_data = UserSerializer(user).data

            return Response(
                {
                    "message": _("Login successful"),
                    "user": user_data,
                    "tokens": {
                        "access": str(access_token),
                        "refresh": str(refresh),
                    },
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(RetrieveUpdateAPIView):
    """User profile view for retrieving and updating profile."""

    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Return the current user."""
        return self.request.user

    def get_serializer_class(self):
        """Return appropriate serializer class based on request method."""
        if self.request.method in ["PUT", "PATCH"]:
            return UserAccountUpdateSerializer
        return UserProfileSerializer

    def update(self, request, *args, **kwargs):
        """Update user profile and account data."""
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()
            # Return updated profile data
            profile_serializer = UserProfileSerializer(instance)
            return Response(
                {
                    "message": _("Profile updated successfully"),
                    "user": profile_serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change user password endpoint."""

    permission_classes = [permissions.IsAuthenticated]

    @method_decorator(ratelimit(key="user", rate="3/m", method="POST", block=True))
    def post(self, request):
        """Change user password."""
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": _("Password changed successfully")},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Logout user by blacklisting refresh token."""

    permission_classes = [permissions.IsAuthenticated]

    @method_decorator(ratelimit(key="user", rate="10/m", method="POST", block=True))
    def post(self, request):
        """Logout user by blacklisting refresh token."""
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(
                    {"message": _("Logout successful")}, status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": _("Refresh token required")},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception:
            return Response(
                {"error": _("Invalid token")}, status=status.HTTP_400_BAD_REQUEST
            )


class CurrentUserView(APIView):
    """Get current user information."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get current user information."""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HealthCheckView(APIView):
    """Health check endpoint for authentication service."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """Health check endpoint for authentication service."""
        return Response(
            {
                "status": "healthy",
                "service": "authentication",
                "message": "Authentication service is running",
            },
            status=status.HTTP_200_OK,
        )
