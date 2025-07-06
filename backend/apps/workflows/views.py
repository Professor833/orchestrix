"""
Views for workflow management.
"""

from django.db import models, transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Workflow, WorkflowNode, WorkflowSchedule, WorkflowTemplate
from .serializers import (
    WorkflowCreateSerializer,
    WorkflowListSerializer,
    WorkflowNodeSerializer,
    WorkflowScheduleSerializer,
    WorkflowSerializer,
    WorkflowTemplateSerializer,
)


class WorkflowTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for workflow templates."""

    serializer_class = WorkflowTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["category", "is_public"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "usage_count"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Filter templates based on user permissions."""
        user = self.request.user
        return WorkflowTemplate.objects.filter(
            models.Q(is_public=True) | models.Q(created_by=user)
        ).select_related("created_by")

    def perform_create(self, serializer):
        """Set the created_by field to the current user."""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def use_template(self, request, pk=None):
        """Create a workflow from a template."""
        template = self.get_object()

        # Get custom name from request or use default
        workflow_name = request.data.get("name", f"{template.name} (from template)")
        workflow_description = request.data.get("description", template.description)

        # Increment usage count
        template.usage_count += 1
        template.save(update_fields=["usage_count"])

        # Create workflow from template
        workflow_data = {
            "name": workflow_name,
            "description": workflow_description,
            "configuration": template.workflow_config,
            "user": request.user,
        }

        with transaction.atomic():
            workflow = Workflow.objects.create(**workflow_data)

            # Create nodes from template
            for node_config in template.node_configs:
                # Create a copy of the node config to avoid modifying the template
                node_data = {
                    "workflow": workflow,
                    "node_type": node_config.get("node_type"),
                    "name": node_config.get("name"),
                    "configuration": node_config.get("configuration", {}),
                    "input_schema": node_config.get("input_schema", {}),
                    "output_schema": node_config.get("output_schema", {}),
                    "position_x": node_config.get("position_x", 0),
                    "position_y": node_config.get("position_y", 0),
                }
                WorkflowNode.objects.create(**node_data)

        serializer = WorkflowSerializer(workflow, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WorkflowViewSet(viewsets.ModelViewSet):
    """ViewSet for workflows."""

    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["status", "is_active", "trigger_type"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Get workflows for the current user."""
        return Workflow.objects.filter(user=self.request.user).prefetch_related(
            "nodes", "schedule", "executions"
        )

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return WorkflowListSerializer
        elif self.action == "create":
            return WorkflowCreateSerializer
        return WorkflowSerializer

    @action(detail=True, methods=["post"])
    def execute(self, request, pk=None):
        """Execute a workflow manually."""
        workflow = self.get_object()

        if not workflow.is_active:
            return Response(
                {"error": "Workflow is not active"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Import here to avoid circular imports
        from apps.workflows.tasks import execute_workflow

        # Execute workflow asynchronously
        task = execute_workflow.delay(
            workflow_id=str(workflow.id),
            user_id=str(request.user.id),
            input_data=request.data.get("trigger_data", {}),
            trigger_source="manual",
        )

        return Response(
            {
                "message": "Workflow execution started",
                "task_id": task.id,
                "workflow_id": workflow.id,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=True, methods=["post"])
    def duplicate(self, request, pk=None):
        """Duplicate a workflow."""
        original_workflow = self.get_object()

        with transaction.atomic():
            # Create new workflow
            new_workflow = Workflow.objects.create(
                user=request.user,
                name=f"{original_workflow.name} (Copy)",
                description=original_workflow.description,
                configuration=original_workflow.configuration,
                trigger_type=original_workflow.trigger_type,
                trigger_config=original_workflow.trigger_config,
                status="draft",
            )

            # Duplicate nodes
            for node in original_workflow.nodes.all():
                WorkflowNode.objects.create(
                    workflow=new_workflow,
                    parent_node=node.parent_node,
                    node_type=node.node_type,
                    name=node.name,
                    configuration=node.configuration,
                    input_schema=node.input_schema,
                    output_schema=node.output_schema,
                    position_x=node.position_x,
                    position_y=node.position_y,
                )

            # Duplicate schedule if exists
            if hasattr(original_workflow, "schedule"):
                schedule = original_workflow.schedule
                WorkflowSchedule.objects.create(
                    workflow=new_workflow,
                    schedule_type=schedule.schedule_type,
                    cron_expression=schedule.cron_expression,
                    schedule_config=schedule.schedule_config,
                    is_active=False,  # Start with inactive schedule
                )

        serializer = WorkflowSerializer(new_workflow, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"])
    def toggle_status(self, request, pk=None):
        """Toggle workflow active status."""
        workflow = self.get_object()
        workflow.is_active = not workflow.is_active
        workflow.save(update_fields=["is_active"])

        serializer = self.get_serializer(workflow)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def metrics(self, request, pk=None):
        """Get workflow execution metrics."""
        workflow = self.get_object()

        # Import here to avoid circular imports
        from apps.executions.models import WorkflowExecution

        executions = WorkflowExecution.objects.filter(workflow=workflow)

        metrics = {
            "total_executions": executions.count(),
            "successful_executions": executions.filter(status="completed").count(),
            "failed_executions": executions.filter(status="failed").count(),
            "running_executions": executions.filter(status="running").count(),
            "average_duration": None,  # TODO: Calculate average duration
            "last_execution": None,
        }

        last_execution = executions.first()
        if last_execution:
            metrics["last_execution"] = {
                "id": last_execution.id,
                "status": last_execution.status,
                "started_at": last_execution.started_at,
                "finished_at": last_execution.completed_at,
            }

        return Response(metrics)


class WorkflowNodeViewSet(viewsets.ModelViewSet):
    """ViewSet for workflow nodes."""

    serializer_class = WorkflowNodeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get nodes for workflows owned by the current user."""
        return WorkflowNode.objects.filter(
            workflow__user=self.request.user
        ).select_related("workflow", "parent_node")

    def perform_create(self, serializer):
        """Ensure user owns the workflow."""
        workflow = serializer.validated_data["workflow"]
        if workflow.user != self.request.user:
            raise PermissionError(
                "You don't have permission to add nodes to this workflow."
            )
        serializer.save()


class WorkflowScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for workflow schedules."""

    serializer_class = WorkflowScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get schedules for workflows owned by the current user."""
        return WorkflowSchedule.objects.filter(
            workflow__user=self.request.user
        ).select_related("workflow")

    def perform_create(self, serializer):
        """Ensure user owns the workflow."""
        workflow = serializer.validated_data["workflow"]
        if workflow.user != self.request.user:
            raise PermissionError(
                "You don't have permission to create schedules for this workflow."
            )
        serializer.save()
