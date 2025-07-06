"""
Django admin configuration for execution models.
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import ExecutionMetrics, NodeExecution, WorkflowExecution


class NodeExecutionInline(admin.TabularInline):
    """Inline admin for NodeExecution model."""

    model = NodeExecution
    extra = 0
    fields = ["node", "status", "started_at", "completed_at", "retry_count"]
    readonly_fields = ["started_at", "completed_at"]
    show_change_link = True


@admin.register(WorkflowExecution)
class WorkflowExecutionAdmin(admin.ModelAdmin):
    """Admin configuration for WorkflowExecution model."""

    list_display = [
        "workflow",
        "user",
        "status",
        "trigger_source",
        "started_at",
        "completed_at",
        "duration_display",
    ]
    list_filter = ["status", "trigger_source", "started_at"]
    search_fields = ["workflow__name", "user__email"]
    readonly_fields = [
        "id",
        "duration_display",
        "is_running_display",
        "is_completed_display",
        "success_rate_display",
        "started_at",
        "completed_at",
    ]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "workflow",
                    "user",
                    "status",
                    "trigger_source",
                )
            },
        ),
        (
            _("Data"),
            {
                "fields": ("input_data", "output_data"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Error Information"),
            {
                "fields": ("error_message",),
                "classes": ("collapse",),
            },
        ),
        (
            _("Context"),
            {
                "fields": ("execution_context",),
                "classes": ("collapse",),
            },
        ),
        (
            _("Statistics"),
            {
                "fields": (
                    "duration_display",
                    "is_running_display",
                    "is_completed_display",
                    "success_rate_display",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            _("Timestamps"),
            {
                "fields": ("started_at", "completed_at"),
            },
        ),
    )
    inlines = [NodeExecutionInline]
    ordering = ["-started_at"]
    date_hierarchy = "started_at"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related("workflow", "user")

    def duration_display(self, obj):
        """Display execution duration."""
        duration = obj.duration
        if duration:
            total_seconds = int(duration.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            if hours:
                return f"{hours}h {minutes}m {seconds}s"
            elif minutes:
                return f"{minutes}m {seconds}s"
            else:
                return f"{seconds}s"
        return _("N/A")

    duration_display.short_description = _("Duration")

    def is_running_display(self, obj):
        """Display if execution is running."""
        return "✅" if obj.is_running else "❌"

    is_running_display.short_description = _("Is Running")
    is_running_display.boolean = True

    def is_completed_display(self, obj):
        """Display if execution is completed."""
        return "✅" if obj.is_completed else "❌"

    is_completed_display.short_description = _("Is Completed")
    is_completed_display.boolean = True

    def success_rate_display(self, obj):
        """Display success rate."""
        return f"{obj.success_rate:.1f}%"

    success_rate_display.short_description = _("Success Rate")


@admin.register(NodeExecution)
class NodeExecutionAdmin(admin.ModelAdmin):
    """Admin configuration for NodeExecution model."""

    list_display = [
        "workflow_execution",
        "node",
        "status",
        "started_at",
        "completed_at",
        "retry_count",
        "duration_display",
    ]
    list_filter = ["status", "started_at", "retry_count"]
    search_fields = ["workflow_execution__workflow__name", "node__name"]
    readonly_fields = [
        "id",
        "duration_display",
        "is_running_display",
        "is_completed_display",
        "started_at",
        "completed_at",
    ]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "workflow_execution",
                    "node",
                    "status",
                    "retry_count",
                )
            },
        ),
        (
            _("Data"),
            {
                "fields": ("input_data", "output_data"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Error Information"),
            {
                "fields": ("error_message",),
                "classes": ("collapse",),
            },
        ),
        (
            _("Logs"),
            {
                "fields": ("execution_logs",),
                "classes": ("collapse",),
            },
        ),
        (
            _("Statistics"),
            {
                "fields": (
                    "duration_display",
                    "is_running_display",
                    "is_completed_display",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            _("Timestamps"),
            {
                "fields": ("started_at", "completed_at"),
            },
        ),
    )
    ordering = ["-started_at"]
    date_hierarchy = "started_at"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related("workflow_execution", "node")

    def duration_display(self, obj):
        """Display node execution duration."""
        duration = obj.duration
        if duration:
            total_seconds = int(duration.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            if hours:
                return f"{hours}h {minutes}m {seconds}s"
            elif minutes:
                return f"{minutes}m {seconds}s"
            else:
                return f"{seconds}s"
        return _("N/A")

    duration_display.short_description = _("Duration")

    def is_running_display(self, obj):
        """Display if node execution is running."""
        return "✅" if obj.is_running else "❌"

    is_running_display.short_description = _("Is Running")
    is_running_display.boolean = True

    def is_completed_display(self, obj):
        """Display if node execution is completed."""
        return "✅" if obj.is_completed else "❌"

    is_completed_display.short_description = _("Is Completed")
    is_completed_display.boolean = True


@admin.register(ExecutionMetrics)
class ExecutionMetricsAdmin(admin.ModelAdmin):
    """Admin configuration for ExecutionMetrics model."""

    list_display = [
        "workflow",
        "user",
        "date",
        "total_executions",
        "successful_executions",
        "failed_executions",
        "success_rate_display",
        "avg_duration_display",
    ]
    list_filter = ["date", "created_at"]
    search_fields = ["workflow__name", "user__email"]
    readonly_fields = [
        "id",
        "success_rate_display",
        "failure_rate_display",
        "avg_duration_display",
        "created_at",
        "updated_at",
    ]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "workflow",
                    "user",
                    "date",
                )
            },
        ),
        (
            _("Execution Counts"),
            {
                "fields": (
                    "total_executions",
                    "successful_executions",
                    "failed_executions",
                ),
            },
        ),
        (
            _("Duration Metrics"),
            {
                "fields": ("avg_duration", "total_duration", "avg_duration_display"),
            },
        ),
        (
            _("Calculated Metrics"),
            {
                "fields": ("success_rate_display", "failure_rate_display"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Timestamps"),
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )
    ordering = ["-date"]
    date_hierarchy = "date"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related("workflow", "user")

    def success_rate_display(self, obj):
        """Display success rate."""
        return f"{obj.success_rate:.1f}%"

    success_rate_display.short_description = _("Success Rate")

    def failure_rate_display(self, obj):
        """Display failure rate."""
        return f"{obj.failure_rate:.1f}%"

    failure_rate_display.short_description = _("Failure Rate")

    def avg_duration_display(self, obj):
        """Display average duration in a readable format."""
        if obj.avg_duration:
            total_seconds = int(obj.avg_duration.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            if hours:
                return f"{hours}h {minutes}m {seconds}s"
            elif minutes:
                return f"{minutes}m {seconds}s"
            else:
                return f"{seconds}s"
        return _("N/A")

    avg_duration_display.short_description = _("Avg Duration")
