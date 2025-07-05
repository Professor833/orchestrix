"""
Serializers for execution models.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import WorkflowExecution, NodeExecution, ExecutionMetrics

User = get_user_model()


class NodeExecutionSerializer(serializers.ModelSerializer):
    """Serializer for NodeExecution model."""

    node_name = serializers.CharField(source="node.name", read_only=True)
    node_type = serializers.CharField(source="node.node_type", read_only=True)
    duration_seconds = serializers.SerializerMethodField()

    class Meta:
        model = NodeExecution
        fields = [
            "id",
            "workflow_execution",
            "node",
            "node_name",
            "node_type",
            "status",
            "input_data",
            "output_data",
            "error_data",
            "started_at",
            "completed_at",
            "duration_seconds",
            "retry_count",
        ]
        read_only_fields = ["id", "started_at", "completed_at", "duration_seconds"]

    def get_duration_seconds(self, obj):
        """Calculate execution duration in seconds."""
        if obj.started_at and obj.completed_at:
            delta = obj.completed_at - obj.started_at
            return delta.total_seconds()
        return None


class WorkflowExecutionSerializer(serializers.ModelSerializer):
    """Serializer for WorkflowExecution model."""

    workflow_name = serializers.CharField(source="workflow.name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    node_executions = NodeExecutionSerializer(many=True, read_only=True)
    duration_seconds = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = WorkflowExecution
        fields = [
            "id",
            "workflow",
            "workflow_name",
            "user",
            "user_email",
            "status",
            "trigger_data",
            "result_data",
            "error_data",
            "started_at",
            "completed_at",
            "duration_seconds",
            "progress_percentage",
            "node_executions",
        ]
        read_only_fields = [
            "id",
            "user",
            "started_at",
            "completed_at",
            "duration_seconds",
            "progress_percentage",
        ]

    def get_duration_seconds(self, obj):
        """Calculate execution duration in seconds."""
        if obj.started_at and obj.completed_at:
            delta = obj.completed_at - obj.started_at
            return delta.total_seconds()
        elif obj.started_at:
            from django.utils import timezone

            delta = timezone.now() - obj.started_at
            return delta.total_seconds()
        return None

    def get_progress_percentage(self, obj):
        """Calculate execution progress percentage."""
        total_nodes = obj.node_executions.count()
        if total_nodes == 0:
            return 0

        completed_nodes = obj.node_executions.filter(
            status__in=["completed", "failed", "skipped"]
        ).count()

        return round((completed_nodes / total_nodes) * 100, 2)


class WorkflowExecutionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for execution lists."""

    workflow_name = serializers.CharField(source="workflow.name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    duration_seconds = serializers.SerializerMethodField()

    class Meta:
        model = WorkflowExecution
        fields = [
            "id",
            "workflow",
            "workflow_name",
            "user_email",
            "status",
            "started_at",
            "completed_at",
            "duration_seconds",
        ]

    def get_duration_seconds(self, obj):
        """Calculate execution duration in seconds."""
        if obj.started_at and obj.completed_at:
            delta = obj.completed_at - obj.started_at
            return delta.total_seconds()
        return None


class ExecutionMetricsSerializer(serializers.ModelSerializer):
    """Serializer for ExecutionMetrics model."""

    workflow_name = serializers.CharField(source="workflow.name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ExecutionMetrics
        fields = [
            "id",
            "workflow",
            "workflow_name",
            "user",
            "user_email",
            "date",
            "total_executions",
            "successful_executions",
            "failed_executions",
            "average_duration",
            "total_duration",
        ]
        read_only_fields = ["id", "user"]


class ExecutionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new executions."""

    class Meta:
        model = WorkflowExecution
        fields = ["workflow", "trigger_data"]

    def validate_workflow(self, value):
        """Validate that user owns the workflow."""
        user = self.context["request"].user
        if value.user != user:
            raise serializers.ValidationError("You don't own this workflow.")

        if not value.is_active:
            raise serializers.ValidationError("Workflow is not active.")

        return value

    def create(self, validated_data):
        """Create execution with user from context."""
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
