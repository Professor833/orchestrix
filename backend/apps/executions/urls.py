"""
URL configuration for executions app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

# Create a router and register viewsets
router = DefaultRouter()
router.register(r"", views.WorkflowExecutionViewSet, basename="workflowexecution")
router.register(r"node-executions", views.NodeExecutionViewSet, basename="nodeexecution")
router.register(r"metrics", views.ExecutionMetricsViewSet, basename="executionmetrics")

urlpatterns = [
    path("", include(router.urls)),
]
