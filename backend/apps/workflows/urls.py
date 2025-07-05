"""
URL configuration for workflows app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register viewsets
router = DefaultRouter()
router.register(r"workflows", views.WorkflowViewSet, basename="workflow")
router.register(r"nodes", views.WorkflowNodeViewSet, basename="workflownode")
router.register(
    r"schedules", views.WorkflowScheduleViewSet, basename="workflowschedule"
)
router.register(
    r"templates", views.WorkflowTemplateViewSet, basename="workflowtemplate"
)

urlpatterns = [
    path("", include(router.urls)),
]
