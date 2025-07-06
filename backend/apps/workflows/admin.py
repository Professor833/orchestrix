"""
Django admin configuration for workflow models.
"""

from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from .models import Workflow, WorkflowNode, WorkflowSchedule, WorkflowTemplate


@admin.register(WorkflowTemplate)
class WorkflowTemplateAdmin(admin.ModelAdmin):
    """Admin configuration for WorkflowTemplate model."""

    list_display = [
        "name",
        "category",
        "created_by",
        "is_public",
        "usage_count",
        "created_at",
    ]
    list_filter = ["category", "is_public", "created_at"]
    search_fields = ["name", "description"]
    readonly_fields = ["id", "usage_count", "created_at", "updated_at"]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "name",
                    "description",
                    "category",
                    "created_by",
                    "is_public",
                )
            },
        ),
        (
            _("Configuration"),
            {
                "fields": ("workflow_config", "node_configs"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Statistics"),
            {
                "fields": ("usage_count",),
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
    ordering = ["-created_at"]
    date_hierarchy = "created_at"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related("created_by")


class WorkflowNodeInline(admin.TabularInline):
    """Inline admin for WorkflowNode model."""

    model = WorkflowNode
    extra = 0
    fields = ["name", "node_type", "position_x", "position_y"]
    readonly_fields = ["id", "created_at", "updated_at"]
    show_change_link = True


@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    """Admin configuration for Workflow model."""

    list_display = [
        "name",
        "user",
        "status",
        "is_active",
        "trigger_type",
        "node_count_display",
        "version",
        "created_at",
    ]
    list_filter = ["status", "is_active", "trigger_type", "created_at"]
    search_fields = ["name", "description", "user__email"]
    readonly_fields = [
        "id",
        "node_count_display",
        "last_execution_display",
        "created_at",
        "updated_at",
    ]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "user",
                    "name",
                    "description",
                    "status",
                    "is_active",
                    "version",
                )
            },
        ),
        (
            _("Trigger Configuration"),
            {
                "fields": ("trigger_type", "trigger_config"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Workflow Configuration"),
            {
                "fields": ("configuration",),
                "classes": ("collapse",),
            },
        ),
        (
            _("Statistics"),
            {
                "fields": ("node_count_display", "last_execution_display"),
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
    inlines = [WorkflowNodeInline]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related("user")

    def node_count_display(self, obj):
        """Display node count."""
        return obj.node_count

    node_count_display.short_description = _("Node Count")

    def last_execution_display(self, obj):
        """Display last execution with link."""
        last_execution = obj.last_execution
        if last_execution:
            url = reverse("admin:executions_workflowexecution_change", args=[last_execution.id])
            return format_html('<a href="{}">{}</a>', url, last_execution.started_at)
        return _("No executions")

    last_execution_display.short_description = _("Last Execution")


@admin.register(WorkflowNode)
class WorkflowNodeAdmin(admin.ModelAdmin):
    """Admin configuration for WorkflowNode model."""

    list_display = [
        "name",
        "workflow",
        "node_type",
        "parent_node",
        "position_x",
        "position_y",
        "created_at",
    ]
    list_filter = ["node_type", "created_at"]
    search_fields = ["name", "workflow__name"]
    readonly_fields = [
        "id",
        "children_count_display",
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
                    "parent_node",
                    "name",
                    "node_type",
                )
            },
        ),
        (
            _("Position"),
            {
                "fields": ("position_x", "position_y"),
            },
        ),
        (
            _("Configuration"),
            {
                "fields": ("configuration", "input_schema", "output_schema"),
                "classes": ("collapse",),
            },
        ),
        (
            _("Statistics"),
            {
                "fields": ("children_count_display",),
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
    ordering = ["workflow", "position_x", "position_y"]

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related("workflow", "parent_node")

    def children_count_display(self, obj):
        """Display children count."""
        return obj.children_count

    children_count_display.short_description = _("Children Count")


@admin.register(WorkflowSchedule)
class WorkflowScheduleAdmin(admin.ModelAdmin):
    """Admin configuration for WorkflowSchedule model."""

    list_display = [
        "workflow",
        "schedule_type",
        "is_active",
        "next_run",
        "last_run",
        "created_at",
    ]
    list_filter = ["schedule_type", "is_active", "created_at"]
    search_fields = ["workflow__name", "cron_expression"]
    readonly_fields = ["id", "created_at", "updated_at"]
    fieldsets = (
        (
            _("Basic Information"),
            {
                "fields": (
                    "id",
                    "workflow",
                    "schedule_type",
                    "is_active",
                )
            },
        ),
        (
            _("Schedule Configuration"),
            {
                "fields": ("cron_expression", "schedule_config"),
            },
        ),
        (
            _("Execution Times"),
            {
                "fields": ("next_run", "last_run"),
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
    ordering = ["-created_at"]
    date_hierarchy = "created_at"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related("workflow")
