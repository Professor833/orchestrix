"""
Management command to create WorkflowNode objects for each WorkflowTemplate.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.workflows.models import Workflow, WorkflowNode, WorkflowTemplate


class Command(BaseCommand):
    help = "Create WorkflowNode objects for each WorkflowTemplate"

    def handle(self, *args, **options):
        """Create nodes for templates."""
        templates = WorkflowTemplate.objects.all()
        self.stdout.write(f"Found {templates.count()} templates")

        for template in templates:
            self.stdout.write(f"Processing template: {template.name}")

            # Create a temporary workflow to hold the nodes
            with transaction.atomic():
                # Create a temporary workflow
                temp_workflow = Workflow.objects.create(
                    name=f"Temp Workflow for {template.name}",
                    description=f"Temporary workflow for template {template.name}",
                    user=template.created_by or Workflow.objects.first().user,  # Fallback to first user if no creator
                    status="draft",
                    configuration=template.workflow_config,
                )

                # Create nodes from template node_configs
                node_count = 0
                for node_config in template.node_configs:
                    node_data = {
                        "workflow": temp_workflow,
                        "node_type": node_config.get("node_type"),
                        "name": node_config.get("name"),
                        "configuration": node_config.get("configuration", {}),
                        "input_schema": node_config.get("input_schema", {}),
                        "output_schema": node_config.get("output_schema", {}),
                        "position_x": node_config.get("position_x", 0),
                        "position_y": node_config.get("position_y", 0),
                    }
                    WorkflowNode.objects.create(**node_data)
                    node_count += 1

                self.stdout.write(self.style.SUCCESS(f"Created {node_count} nodes for template: {template.name}"))

        self.stdout.write(self.style.SUCCESS("Successfully created nodes for all templates"))
