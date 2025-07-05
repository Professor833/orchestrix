"""
Workflow models for workflow management and orchestration.
"""

import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class WorkflowTemplate(models.Model):
    """Template for reusable workflows."""

    CATEGORY_CHOICES = [
        ("ai", _("AI & Machine Learning")),
        ("data", _("Data Processing")),
        ("automation", _("Automation")),
        ("integration", _("Integration")),
        ("notification", _("Notification")),
        ("utility", _("Utility")),
        ("custom", _("Custom")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_("name"), max_length=200)
    description = models.TextField(_("description"), blank=True)
    category = models.CharField(_("category"), max_length=50, choices=CATEGORY_CHOICES)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )
    workflow_config = models.JSONField(_("workflow configuration"), default=dict)
    node_configs = models.JSONField(_("node configurations"), default=list)
    is_public = models.BooleanField(_("is public"), default=False)
    usage_count = models.PositiveIntegerField(_("usage count"), default=0)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("Workflow Template")
        verbose_name_plural = _("Workflow Templates")
        db_table = "workflow_templates"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Workflow(models.Model):
    """Main workflow model."""

    STATUS_CHOICES = [
        ("draft", _("Draft")),
        ("active", _("Active")),
        ("paused", _("Paused")),
        ("archived", _("Archived")),
    ]

    TRIGGER_CHOICES = [
        ("manual", _("Manual")),
        ("scheduled", _("Scheduled")),
        ("webhook", _("Webhook")),
        ("api", _("API Call")),
        ("event", _("Event Driven")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workflows")
    name = models.CharField(_("name"), max_length=200)
    description = models.TextField(_("description"), blank=True)
    configuration = models.JSONField(_("configuration"), default=dict)
    status = models.CharField(
        _("status"), max_length=20, choices=STATUS_CHOICES, default="draft"
    )
    is_active = models.BooleanField(_("is active"), default=True)
    trigger_type = models.CharField(
        _("trigger type"), max_length=20, choices=TRIGGER_CHOICES, default="manual"
    )
    trigger_config = models.JSONField(_("trigger configuration"), default=dict)
    version = models.PositiveIntegerField(_("version"), default=1)
    category = models.CharField(_("category"), max_length=50, blank=True, null=True)
    tags = models.JSONField(_("tags"), default=list)
    last_run_at = models.DateTimeField(_("last run at"), null=True, blank=True)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("Workflow")
        verbose_name_plural = _("Workflows")
        db_table = "workflows"
        ordering = ["-created_at"]
        unique_together = ["user", "name"]

    def __str__(self):
        return f"{self.user.email} - {self.name}"

    @property
    def node_count(self):
        """Get the number of nodes in this workflow."""
        return self.nodes.count()

    @property
    def last_execution(self):
        """Get the most recent execution of this workflow."""
        return self.executions.first()


class WorkflowNode(models.Model):
    """Individual nodes within a workflow."""

    NODE_TYPE_CHOICES = [
        ("trigger", _("Trigger")),
        ("action", _("Action")),
        ("condition", _("Condition")),
        ("loop", _("Loop")),
        ("parallel", _("Parallel")),
        ("merge", _("Merge")),
        ("ai_chat", _("AI Chat")),
        ("ai_completion", _("AI Completion")),
        ("api_call", _("API Call")),
        ("webhook", _("Webhook")),
        ("email", _("Email")),
        ("sms", _("SMS")),
        ("notification", _("Notification")),
        ("data_transform", _("Data Transform")),
        ("file_process", _("File Process")),
        ("database", _("Database")),
        ("custom", _("Custom")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(
        Workflow, on_delete=models.CASCADE, related_name="nodes"
    )
    parent_node = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children"
    )
    node_type = models.CharField(
        _("node type"), max_length=50, choices=NODE_TYPE_CHOICES
    )
    name = models.CharField(_("name"), max_length=200)
    configuration = models.JSONField(_("configuration"), default=dict)
    input_schema = models.JSONField(_("input schema"), default=dict)
    output_schema = models.JSONField(_("output schema"), default=dict)
    position_x = models.FloatField(_("position x"), default=0)
    position_y = models.FloatField(_("position y"), default=0)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("Workflow Node")
        verbose_name_plural = _("Workflow Nodes")
        db_table = "workflow_nodes"
        ordering = ["position_x", "position_y"]

    def __str__(self):
        return f"{self.workflow.name} - {self.name}"

    @property
    def is_trigger(self):
        """Check if this node is a trigger node."""
        return self.node_type == "trigger"

    @property
    def children_count(self):
        """Get the number of child nodes."""
        return self.children.count()


class WorkflowSchedule(models.Model):
    """Scheduling configuration for workflows."""

    SCHEDULE_TYPE_CHOICES = [
        ("once", _("Once")),
        ("interval", _("Interval")),
        ("cron", _("Cron")),
        ("daily", _("Daily")),
        ("weekly", _("Weekly")),
        ("monthly", _("Monthly")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.OneToOneField(
        Workflow, on_delete=models.CASCADE, related_name="schedule"
    )
    schedule_type = models.CharField(
        _("schedule type"), max_length=20, choices=SCHEDULE_TYPE_CHOICES
    )
    cron_expression = models.CharField(_("cron expression"), max_length=100, blank=True)
    schedule_config = models.JSONField(_("schedule configuration"), default=dict)
    is_active = models.BooleanField(_("is active"), default=True)
    next_run = models.DateTimeField(_("next run"), null=True, blank=True)
    last_run = models.DateTimeField(_("last run"), null=True, blank=True)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("Workflow Schedule")
        verbose_name_plural = _("Workflow Schedules")
        db_table = "workflow_schedules"

    def __str__(self):
        return f"{self.workflow.name} - {self.schedule_type}"
