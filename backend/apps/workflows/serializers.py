"""
Serializers for workflow models.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Workflow, WorkflowNode, WorkflowSchedule, WorkflowTemplate

User = get_user_model()


class WorkflowTemplateSerializer(serializers.ModelSerializer):
    """Serializer for WorkflowTemplate model."""

    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    nodes = serializers.SerializerMethodField()

    class Meta:
        model = WorkflowTemplate
        fields = [
            "id",
            "name",
            "description",
            "category",
            "created_by",
            "created_by_email",
            "workflow_config",
            "node_configs",
            "nodes",
            "is_public",
            "usage_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "usage_count",
            "created_at",
            "updated_at",
        ]

    def get_nodes(self, obj):
        """Get nodes from workflows created from this template."""
        from apps.workflows.models import Workflow, WorkflowNode

        # Find workflows created from this template
        workflows = Workflow.objects.filter(
            name__startswith=f"Temp Workflow for {obj.name}"
        )

        if not workflows.exists():
            return []

        # Get nodes from the first workflow
        workflow = workflows.first()
        nodes = WorkflowNode.objects.filter(workflow=workflow)

        # Manually create a simplified representation of the nodes
        return [
            {
                "id": str(node.id),
                "node_type": node.node_type,
                "name": node.name,
                "description": node.configuration.get("description", ""),
                "position_x": node.position_x,
                "position_y": node.position_y,
            }
            for node in nodes
        ]


class WorkflowNodeSerializer(serializers.ModelSerializer):
    """Serializer for WorkflowNode model."""

    children_count = serializers.IntegerField(read_only=True)
    is_trigger = serializers.BooleanField(read_only=True)

    class Meta:
        model = WorkflowNode
        fields = [
            "id",
            "workflow",
            "parent_node",
            "node_type",
            "name",
            "configuration",
            "input_schema",
            "output_schema",
            "position_x",
            "position_y",
            "children_count",
            "is_trigger",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_node_type(self, value):
        """Validate node type."""
        valid_types = [choice[0] for choice in WorkflowNode.NODE_TYPE_CHOICES]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Invalid node type. Must be one of: {valid_types}"
            )
        return value


class WorkflowScheduleSerializer(serializers.ModelSerializer):
    """Serializer for WorkflowSchedule model."""

    class Meta:
        model = WorkflowSchedule
        fields = [
            "id",
            "workflow",
            "schedule_type",
            "cron_expression",
            "schedule_config",
            "is_active",
            "next_run",
            "last_run",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "next_run", "last_run", "created_at", "updated_at"]

    def validate_cron_expression(self, value):
        """Validate cron expression if schedule_type is 'cron'."""
        if self.initial_data.get("schedule_type") == "cron" and not value:
            raise serializers.ValidationError(
                "Cron expression is required when schedule_type is 'cron'."
            )
        return value


class WorkflowSerializer(serializers.ModelSerializer):
    """Serializer for Workflow model."""

    user_email = serializers.EmailField(source="user.email", read_only=True)
    node_count = serializers.IntegerField(read_only=True)
    nodes = WorkflowNodeSerializer(many=True, read_only=True)
    schedule = WorkflowScheduleSerializer(read_only=True)
    last_execution = serializers.SerializerMethodField()

    class Meta:
        model = Workflow
        fields = [
            "id",
            "user",
            "user_email",
            "name",
            "description",
            "configuration",
            "status",
            "is_active",
            "trigger_type",
            "trigger_config",
            "version",
            "node_count",
            "nodes",
            "schedule",
            "last_execution",
            "category",
            "tags",
            "last_run_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "version", "created_at", "updated_at"]

    def get_last_execution(self, obj):
        """Get the last execution summary."""
        last_exec = obj.last_execution
        if last_exec:
            return {
                "id": last_exec.id,
                "status": last_exec.status,
                "started_at": last_exec.started_at,
                "finished_at": last_exec.completed_at,
            }
        return None

    def validate_name(self, value):
        """Validate workflow name uniqueness for user."""
        user = self.context["request"].user
        queryset = Workflow.objects.filter(user=user, name=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError(
                "A workflow with this name already exists."
            )
        return value

    def validate_status(self, value):
        """Validate status changes."""
        valid_statuses = [choice[0] for choice in Workflow.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Invalid status. Must be one of: {valid_statuses}"
            )
        return value

    def validate_trigger_type(self, value):
        """Validate trigger type."""
        valid_triggers = [choice[0] for choice in Workflow.TRIGGER_CHOICES]
        if value not in valid_triggers:
            raise serializers.ValidationError(
                f"Invalid trigger type. Must be one of: {valid_triggers}"
            )
        return value


class WorkflowCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating workflows with nodes."""

    nodes = WorkflowNodeSerializer(many=True, required=False)
    schedule = WorkflowScheduleSerializer(required=False)

    class Meta:
        model = Workflow
        fields = [
            "name",
            "description",
            "configuration",
            "status",
            "is_active",
            "trigger_type",
            "trigger_config",
            "nodes",
            "schedule",
        ]

    def create(self, validated_data):
        """Create workflow with nodes and schedule."""
        nodes_data = validated_data.pop("nodes", [])
        schedule_data = validated_data.pop("schedule", None)

        # Set the user from the request context
        validated_data["user"] = self.context["request"].user

        workflow = Workflow.objects.create(**validated_data)

        # Create nodes
        for node_data in nodes_data:
            node_data["workflow"] = workflow
            WorkflowNode.objects.create(**node_data)

        # Create schedule if provided
        if schedule_data:
            schedule_data["workflow"] = workflow
            WorkflowSchedule.objects.create(**schedule_data)

        return workflow


class WorkflowListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for workflow lists."""

    user_email = serializers.EmailField(source="user.email", read_only=True)
    node_count = serializers.IntegerField(read_only=True)
    last_execution_status = serializers.SerializerMethodField()

    class Meta:
        model = Workflow
        fields = [
            "id",
            "user_email",
            "name",
            "description",
            "status",
            "is_active",
            "trigger_type",
            "node_count",
            "last_execution_status",
            "category",
            "tags",
            "last_run_at",
            "created_at",
            "updated_at",
        ]

    def get_last_execution_status(self, obj):
        """Get the status of the last execution."""
        last_exec = obj.last_execution
        return last_exec.status if last_exec else None
