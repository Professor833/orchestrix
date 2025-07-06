import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker

from apps.executions.models import ExecutionMetrics, NodeExecution, WorkflowExecution
from apps.integrations.models import (
    IntegrationCategory,
    IntegrationTemplate,
    WebhookEndpoint,
)
from apps.workflows.models import Workflow


class Command(BaseCommand):
    help = "Populates the database with additional real-world data for integrations " "and executions."

    def handle(self, *args, **kwargs):
        fake = Faker()
        self.stdout.write(self.style.SUCCESS("Starting to populate real-world data..."))

        with transaction.atomic():
            self.create_integration_data()
            self.create_execution_data()
            self._create_webhook_endpoints(fake)

        self.stdout.write(self.style.SUCCESS("Successfully populated the database with additional data."))

    def create_integration_data(self):
        self.stdout.write("Creating integration categories and templates...")

        # Categories
        communication_cat = self._get_or_create_category(
            "Communication", "Tools for team communication and notifications."
        )
        _productivity_cat = self._get_or_create_category("Productivity", "Integrations to boost team productivity.")
        dev_tools_cat = self._get_or_create_category("Developer Tools", "Tools for software development and CI/CD.")

        # Templates
        IntegrationTemplate.objects.get_or_create(
            name="Slack",
            category=communication_cat,
            defaults={
                "service_type": "OAUTH",
                "description": "Send notifications to Slack channels.",
                "configuration_schema": {"channel": {"type": "string", "required": True}},
                "credential_schema": {"api_key": {"type": "password", "required": True}},
            },
        )
        IntegrationTemplate.objects.get_or_create(
            name="Twilio",
            category=communication_cat,
            defaults={
                "service_type": "API_KEY",
                "description": "Send SMS messages.",
                "configuration_schema": {"from_number": {"type": "string", "required": True}},
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
                "configuration_schema": {"repository": {"type": "string", "required": True}},
                "credential_schema": {"access_token": {"type": "password", "required": True}},
            },
        )
        self.stdout.write(self.style.SUCCESS("Integration data created."))

    def create_execution_data(self):
        self.stdout.write("Creating execution data for existing workflows...")
        workflows = list(Workflow.objects.all())
        if not workflows:
            self.stdout.write(self.style.WARNING("No workflows found. Skipping execution data creation."))
            return

        for workflow in workflows:
            for i in range(random.randint(5, 15)):
                start_time = timezone.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
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

    def _get_or_create_category(self, name, description):
        category, created = IntegrationCategory.objects.get_or_create(name=name, defaults={"description": description})
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created integration category: {name}"))
        return category

    def _create_webhook_endpoints(self, fake):
        self.stdout.write("Creating webhook endpoints...")
        workflows = list(Workflow.objects.all())
        if not workflows:
            self.stdout.write(self.style.WARNING("No workflows found. Cannot create webhook endpoints."))
            return

        webhooks_data = [
            {
                "name": "GitHub Push Webhook",
                "description": "Triggers on a push event to the main branch.",
                "target_url": f"https://{fake.domain_name()}/webhooks/github/push",
            },
            {
                "name": "Stripe Payment Succeeded Webhook",
                "description": "Triggers on successful payment events from Stripe.",
                "target_url": f"https://{fake.domain_name()}/webhooks/stripe/payment",
            },
            {
                "name": "Slack Mention Webhook",
                "description": "Triggers when the bot is mentioned in a Slack channel.",
                "target_url": f"https://{fake.domain_name()}/webhooks/slack/mention",
            },
        ]

        for i, data in enumerate(webhooks_data):
            workflow = workflows[i % len(workflows)]
            webhook, created = WebhookEndpoint.objects.get_or_create(
                name=data["name"],
                defaults={
                    "description": data["description"],
                    "target_url": data["target_url"],
                    "workflow": workflow,
                    "created_by": workflow.user,
                },
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created webhook endpoint: {webhook.name}"))
