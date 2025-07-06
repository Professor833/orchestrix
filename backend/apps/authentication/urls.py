"""
Authentication URL configuration.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    CurrentUserView,
    HealthCheckView,
    LogoutView,
    UserLoginView,
    UserProfileView,
    UserRegistrationView,
)

app_name = "authentication"

urlpatterns = [
    # Authentication endpoints
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("login/", UserLoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # User profile endpoints
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    # Health check
    path("health/", HealthCheckView.as_view(), name="health_check"),
]
