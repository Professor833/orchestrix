import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.executions.models import ExecutionMetrics, NodeExecution, WorkflowExecution
from apps.integrations.models import IntegrationCategory, IntegrationTemplate
from apps.workflows.models import Workflow


class Command(BaseCommand):
    help = "Populates the database with additional real-world data for integrations and executions."

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting data population...")

        self.create_integration_data()
        self.create_execution_data()

        self.stdout.write(
            self.style.SUCCESS(
                "Successfully populated the database with additional data."
            )
        )

    def create_integration_data(self):
        self.stdout.write("Creating integration categories and templates...")

        # Categories
        communication_cat, _ = IntegrationCategory.objects.get_or_create(
            name="Communication",
            defaults={"description": "Tools for team communication and notifications."},
        )
        productivity_cat, _ = IntegrationCategory.objects.get_or_create(
            name="Productivity",
            defaults={"description": "Integrations to boost team productivity."},
        )
        dev_tools_cat, _ = IntegrationCategory.objects.get_or_create(
            name="Developer Tools",
            defaults={"description": "Tools for software development and CI/CD."},
        )

        # Templates
        IntegrationTemplate.objects.get_or_create(
            name="Slack",
            category=communication_cat,
            defaults={
                "service_type": "OAUTH",
                "description": "Send notifications to Slack channels.",
                "configuration_schema": {
                    "channel": {"type": "string", "required": True}
                },
                "credential_schema": {
                    "api_key": {"type": "password", "required": True}
                },
            },
        )
        IntegrationTemplate.objects.get_or_create(
            name="Twilio",
            category=communication_cat,
            defaults={
                "service_type": "API_KEY",
                "description": "Send SMS messages.",
                "configuration_schema": {
                    "from_number": {"type": "string", "required": True}
                },
                "credential_schema": {
                    "account_sid": {"type": "string", "required": True},
                    "auth_token": {"type": "password", "required": True},
                },
            },
        )
        IntegrationTemplate.objects.get_or_create(
            name="GitHub",
            category=dev_tools_cat,
            defaults={
                "service_type": "OAUTH",
                "description": "Interact with GitHub repositories.",
                "configuration_schema": {
                    "repository": {"type": "string", "required": True}
                },
                "credential_schema": {
                    "access_token": {"type": "password", "required": True}
                },
            },
        )
        self.stdout.write(self.style.SUCCESS("Integration data created."))

    def create_execution_data(self):
        self.stdout.write("Creating execution data for existing workflows...")
        workflows = list(Workflow.objects.all())
        if not workflows:
            self.stdout.write(
                self.style.WARNING(
                    "No workflows found. Skipping execution data creation."
                )
            )
            return

        for workflow in workflows:
            for i in range(random.randint(5, 15)):
                start_time = timezone.now() - timedelta(
                    days=random.randint(0, 30), hours=random.randint(0, 23)
                )
                end_time = start_time + timedelta(minutes=random.randint(1, 10))
                status = random.choice(
                    [
                        WorkflowExecution.STATUS_CHOICES[2][0],
                        WorkflowExecution.STATUS_CHOICES[3][0],
                        WorkflowExecution.STATUS_CHOICES[1][0],
                    ]
                )

                if status == WorkflowExecution.STATUS_CHOICES[1][0]:
                    end_time = None

                execution = WorkflowExecution.objects.create(
                    workflow=workflow,
                    user=workflow.owner,
                    started_at=start_time,
                    completed_at=end_time,
                    status=status,
                )

                # Create logs for node executions
                for node in workflow.nodes.all():
                    node_execution = NodeExecution.objects.create(
                        workflow_execution=execution,
                        node=node,
                        status="completed" if status == "completed" else "pending",
                    )
                    node_execution.add_log("INFO", f"Node {node.name} executed.")

                # Create metrics
                if status == "completed":
                    ExecutionMetrics.objects.create(
                        workflow=workflow,
                        user=workflow.owner,
                        date=start_time.date(),
                        total_executions=1,
                        successful_executions=1,
                    )

        self.stdout.write(self.style.SUCCESS("Execution data created."))
