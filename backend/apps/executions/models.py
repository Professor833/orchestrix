"""
Execution models for workflow execution tracking and monitoring.
"""

import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class WorkflowExecution(models.Model):
    """Tracks individual workflow executions."""

    STATUS_CHOICES = [
        ("pending", _("Pending")),
        ("running", _("Running")),
        ("completed", _("Completed")),
        ("failed", _("Failed")),
        ("cancelled", _("Cancelled")),
        ("timeout", _("Timeout")),
    ]

    TRIGGER_SOURCE_CHOICES = [
        ("manual", _("Manual")),
        ("scheduled", _("Scheduled")),
        ("webhook", _("Webhook")),
        ("api", _("API")),
        ("event", _("Event")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(
        "workflows.Workflow", on_delete=models.CASCADE, related_name="executions"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="executions")
    status = models.CharField(
        _("status"), max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    input_data = models.JSONField(_("input data"), default=dict)
    output_data = models.JSONField(_("output data"), default=dict)
    started_at = models.DateTimeField(_("started at"), auto_now_add=True)
    completed_at = models.DateTimeField(_("completed at"), null=True, blank=True)
    error_message = models.TextField(_("error message"), blank=True)
    trigger_source = models.CharField(
        _("trigger source"),
        max_length=20,
        choices=TRIGGER_SOURCE_CHOICES,
        default="manual",
    )
    execution_context = models.JSONField(_("execution context"), default=dict)

    class Meta:
        verbose_name = _("Workflow Execution")
        verbose_name_plural = _("Workflow Executions")
        db_table = "workflow_executions"
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["workflow", "status"]),
            models.Index(fields=["user", "started_at"]),
            models.Index(fields=["status", "started_at"]),
        ]

    def __str__(self):
        return f"{self.workflow.name} - {self.started_at.strftime('%Y-%m-%d %H:%M:%S')}"

    @property
    def duration(self):
        """Get execution duration."""
        if self.completed_at:
            return self.completed_at - self.started_at
        return timezone.now() - self.started_at

    @property
    def is_running(self):
        """Check if execution is currently running."""
        return self.status == "running"

    @property
    def is_completed(self):
        """Check if execution is completed (success or failure)."""
        return self.status in ["completed", "failed", "cancelled", "timeout"]

    @property
    def success_rate(self):
        """Get success rate for this workflow."""
        total = self.workflow.executions.count()
        if total == 0:
            return 0
        successful = self.workflow.executions.filter(status="completed").count()
        return (successful / total) * 100

    def mark_as_completed(self, output_data=None):
        """Mark execution as completed."""
        self.status = "completed"
        self.completed_at = timezone.now()
        if output_data:
            self.output_data = output_data
        self.save()

    def mark_as_failed(self, error_message):
        """Mark execution as failed."""
        self.status = "failed"
        self.completed_at = timezone.now()
        self.error_message = error_message
        self.save()


class NodeExecution(models.Model):
    """Tracks individual node executions within a workflow execution."""

    STATUS_CHOICES = [
        ("pending", _("Pending")),
        ("running", _("Running")),
        ("completed", _("Completed")),
        ("failed", _("Failed")),
        ("skipped", _("Skipped")),
        ("timeout", _("Timeout")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_execution = models.ForeignKey(
        WorkflowExecution, on_delete=models.CASCADE, related_name="node_executions"
    )
    node = models.ForeignKey(
        "workflows.WorkflowNode", on_delete=models.CASCADE, related_name="executions"
    )
    status = models.CharField(
        _("status"), max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    input_data = models.JSONField(_("input data"), default=dict)
    output_data = models.JSONField(_("output data"), default=dict)
    started_at = models.DateTimeField(_("started at"), auto_now_add=True)
    completed_at = models.DateTimeField(_("completed at"), null=True, blank=True)
    error_message = models.TextField(_("error message"), blank=True)
    retry_count = models.PositiveIntegerField(_("retry count"), default=0)
    execution_logs = models.JSONField(_("execution logs"), default=list)

    class Meta:
        verbose_name = _("Node Execution")
        verbose_name_plural = _("Node Executions")
        db_table = "node_executions"
        ordering = ["started_at"]
        indexes = [
            models.Index(fields=["workflow_execution", "status"]),
            models.Index(fields=["node", "started_at"]),
        ]

    def __str__(self):
        return f"{self.workflow_execution} - {self.node.name}"

    @property
    def duration(self):
        """Get node execution duration."""
        if self.completed_at:
            return self.completed_at - self.started_at
        return timezone.now() - self.started_at

    @property
    def is_running(self):
        """Check if node execution is currently running."""
        return self.status == "running"

    @property
    def is_completed(self):
        """Check if node execution is completed."""
        return self.status in ["completed", "failed", "skipped", "timeout"]

    def add_log(self, level, message, data=None):
        """Add a log entry to the execution logs."""
        log_entry = {
            "timestamp": timezone.now().isoformat(),
            "level": level,
            "message": message,
            "data": data or {},
        }
        self.execution_logs.append(log_entry)
        self.save()

    def mark_as_completed(self, output_data=None):
        """Mark node execution as completed."""
        self.status = "completed"
        self.completed_at = timezone.now()
        if output_data:
            self.output_data = output_data
        self.save()

    def mark_as_failed(self, error_message):
        """Mark node execution as failed."""
        self.status = "failed"
        self.completed_at = timezone.now()
        self.error_message = error_message
        self.save()


class ExecutionMetrics(models.Model):
    """Stores aggregated metrics for executions."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(
        "workflows.Workflow", on_delete=models.CASCADE, related_name="metrics"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="execution_metrics"
    )
    date = models.DateField(_("date"), auto_now_add=True)
    total_executions = models.PositiveIntegerField(_("total executions"), default=0)
    successful_executions = models.PositiveIntegerField(
        _("successful executions"), default=0
    )
    failed_executions = models.PositiveIntegerField(_("failed executions"), default=0)
    avg_duration = models.DurationField(_("average duration"), null=True, blank=True)
    total_duration = models.DurationField(_("total duration"), null=True, blank=True)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("Execution Metrics")
        verbose_name_plural = _("Execution Metrics")
        db_table = "execution_metrics"
        unique_together = ["workflow", "user", "date"]
        indexes = [
            models.Index(fields=["workflow", "date"]),
            models.Index(fields=["user", "date"]),
        ]

    def __str__(self):
        return f"{self.workflow.name} - {self.date}"

    @property
    def success_rate(self):
        """Calculate success rate."""
        if self.total_executions == 0:
            return 0
        return (self.successful_executions / self.total_executions) * 100

    @property
    def failure_rate(self):
        """Calculate failure rate."""
        if self.total_executions == 0:
            return 0
        return (self.failed_executions / self.total_executions) * 100
