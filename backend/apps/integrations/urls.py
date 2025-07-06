"""
URL configuration for integrations app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

# Create a router and register viewsets
router = DefaultRouter()
router.register(
    r"categories", views.IntegrationCategoryViewSet, basename="integrationcategory"
)
router.register(
    r"templates", views.IntegrationTemplateViewSet, basename="integrationtemplate"
)
router.register(r"", views.IntegrationViewSet, basename="integration")
router.register(r"logs", views.IntegrationLogViewSet, basename="integrationlog")
router.register(r"webhooks", views.WebhookEndpointViewSet, basename="webhookendpoint")
router.register(r"webhook-events", views.WebhookEventViewSet, basename="webhookevent")

urlpatterns = [
    path("", include(router.urls)),
]
