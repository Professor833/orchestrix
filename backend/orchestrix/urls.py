"""
URL configuration for orchestrix project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from django.http import JsonResponse


def health_check(request):
    """Simple health check endpoint."""
    return JsonResponse({"status": "healthy", "message": "Orchestrix API is running"})


urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    # Health check
    path("health/", health_check, name="health_check"),
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # API v1 routes
    path("api/v1/auth/", include("apps.authentication.urls")),
    path("api/v1/workflows/", include("apps.workflows.urls")),
    path("api/v1/executions/", include("apps.executions.urls")),
    path("api/v1/integrations/", include("apps.integrations.urls")),
    # Django health check
    path("ht/", include("health_check.urls")),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
