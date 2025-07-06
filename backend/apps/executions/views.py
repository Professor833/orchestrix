"""
Views for execution management.
"""

from datetime import timedelta

from django.db import models
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ExecutionMetrics, NodeExecution, WorkflowExecution
from .serializers import (
    ExecutionCreateSerializer,
    ExecutionMetricsSerializer,
    NodeExecutionSerializer,
    WorkflowExecutionListSerializer,
    WorkflowExecutionSerializer,
)


class WorkflowExecutionViewSet(viewsets.ModelViewSet):
    """ViewSet for workflow executions."""

    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["status", "workflow"]
    search_fields = ["workflow__name"]
    ordering_fields = ["started_at", "completed_at"]
    ordering = ["-started_at"]

    def get_queryset(self):
        """Get executions for workflows owned by the current user."""
        return (
            WorkflowExecution.objects.filter(user=self.request.user)
            .select_related("workflow", "user")
            .prefetch_related("node_executions")
        )

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return WorkflowExecutionListSerializer
        elif self.action == "create":
            return ExecutionCreateSerializer
        return WorkflowExecutionSerializer

    def perform_create(self, serializer):
        """Create execution and trigger async processing."""
        execution = serializer.save(user=self.request.user)

        # Import here to avoid circular imports
        from apps.workflows.tasks import execute_workflow

        # Start async execution
        execute_workflow.delay(
            workflow_id=str(execution.workflow.id),
            user_id=str(self.request.user.id),
            input_data=execution.input_data,
            trigger_source="manual",
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel a running execution."""
        execution = self.get_object()

        if execution.status not in ["running", "pending"]:
            return Response(
                {"error": "Execution is not running"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        execution.status = "cancelled"
        execution.completed_at = timezone.now()
        execution.save(update_fields=["status", "completed_at"])

        # Cancel running node executions
        execution.node_executions.filter(status="running").update(status="cancelled", completed_at=timezone.now())

        serializer = self.get_serializer(execution)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def retry(self, request, pk=None):
        """Retry a failed execution."""
        execution = self.get_object()

        if execution.status != "failed":
            return Response(
                {"error": "Only failed executions can be retried"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Import here to avoid circular imports
        from apps.workflows.tasks import execute_workflow

        # Create new execution for retry
        new_execution = WorkflowExecution.objects.create(
            workflow=execution.workflow,
            user=execution.user,
            input_data=execution.input_data,
            status="pending",
        )

        # Start async execution
        execute_workflow.delay(
            workflow_id=str(new_execution.workflow.id),
            user_id=str(request.user.id),
            input_data=new_execution.input_data,
            trigger_source="retry",
        )

        serializer = self.get_serializer(new_execution)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get execution statistics."""
        executions = self.get_queryset()

        # Get date range from query params (default to last 30 days)
        days = int(request.query_params.get("days", 30))
        start_date = timezone.now() - timedelta(days=days)

        recent_executions = executions.filter(started_at__gte=start_date)

        stats = {
            "total_executions": recent_executions.count(),
            "successful_executions": recent_executions.filter(status="completed").count(),
            "failed_executions": recent_executions.filter(status="failed").count(),
            "running_executions": recent_executions.filter(status="running").count(),
            "cancelled_executions": recent_executions.filter(status="cancelled").count(),
            "average_duration": None,
            "workflows_executed": recent_executions.values("workflow").distinct().count(),
        }

        # Calculate average duration for completed executions
        completed_executions = recent_executions.filter(status="completed", completed_at__isnull=False)

        if completed_executions.exists():
            durations = []
            for execution in completed_executions:
                if execution.started_at and execution.completed_at:
                    duration = execution.completed_at - execution.started_at
                    durations.append(duration.total_seconds())

            if durations:
                stats["average_duration"] = sum(durations) / len(durations)

        return Response(stats)


class NodeExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for node executions (read-only)."""

    serializer_class = NodeExecutionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "node__node_type", "workflow_execution"]
    ordering_fields = ["started_at", "completed_at"]
    ordering = ["started_at"]

    def get_queryset(self):
        """Get node executions for workflows owned by the current user."""
        return NodeExecution.objects.filter(workflow_execution__user=self.request.user).select_related(
            "workflow_execution", "node"
        )

    @action(detail=True, methods=["post"])
    def retry_node(self, request, pk=None):
        """Retry a failed node execution."""
        node_execution = self.get_object()

        if node_execution.status != "failed":
            return Response(
                {"error": "Only failed node executions can be retried"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Import here to avoid circular imports
        from apps.executions.tasks import execute_node_task

        # Reset node execution status
        node_execution.status = "pending"
        node_execution.started_at = None
        node_execution.completed_at = None
        node_execution.error_data = {}
        node_execution.output_data = {}
        node_execution.retry_count += 1
        node_execution.save()

        # Execute node asynchronously
        execute_node_task.delay(
            node_execution_id=str(node_execution.id),
            input_data=node_execution.input_data,
        )

        serializer = self.get_serializer(node_execution)
        return Response(serializer.data)


class ExecutionMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for execution metrics (read-only)."""

    serializer_class = ExecutionMetricsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["workflow", "date"]
    ordering_fields = ["date"]
    ordering = ["-date"]

    def get_queryset(self):
        """Get metrics for workflows owned by the current user."""
        return ExecutionMetrics.objects.filter(user=self.request.user).select_related("workflow", "user")

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get metrics summary."""
        metrics = self.get_queryset()

        # Get date range from query params
        days = int(request.query_params.get("days", 30))
        start_date = timezone.now().date() - timedelta(days=days)

        recent_metrics = metrics.filter(date__gte=start_date)

        summary = {
            "total_days": recent_metrics.count(),
            "total_executions": recent_metrics.aggregate(total=models.Sum("total_executions"))["total"] or 0,
            "total_successful": recent_metrics.aggregate(total=models.Sum("successful_executions"))["total"] or 0,
            "total_failed": recent_metrics.aggregate(total=models.Sum("failed_executions"))["total"] or 0,
            "average_daily_executions": recent_metrics.aggregate(avg=models.Avg("total_executions"))["avg"] or 0,
            "average_duration": recent_metrics.aggregate(avg=models.Avg("average_duration"))["avg"] or 0,
        }

        # Calculate success rate
        total_executions = summary["total_executions"]
        if total_executions > 0:
            summary["success_rate"] = (summary["total_successful"] / total_executions) * 100
        else:
            summary["success_rate"] = 0

        return Response(summary)
