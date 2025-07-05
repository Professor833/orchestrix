"""
Management command to populate workflow templates with real-world use cases.
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.workflows.models import WorkflowTemplate

User = get_user_model()


class Command(BaseCommand):
    help = "Populate workflow templates with real-world use cases"

    def handle(self, *args, **options):
        """Create workflow templates."""

        # Get or create a system user for templates
        system_user, created = User.objects.get_or_create(
            email="system@orchestrix.com",
            defaults={
                "first_name": "System",
                "last_name": "User",
                "is_active": True,
            },
        )

        templates = [
            {
                "name": "Email Newsletter Automation",
                "description": "Automatically send personalized newsletters to subscribers based on their preferences and behavior.",
                "category": "automation",
                "workflow_config": {
                    "trigger_type": "scheduled",
                    "schedule": "weekly",
                    "timezone": "UTC",
                },
                "node_configs": [
                    {
                        "node_type": "trigger",
                        "name": "Weekly Schedule",
                        "configuration": {
                            "schedule_type": "weekly",
                            "day_of_week": "monday",
                            "time": "09:00",
                        },
                        "position_x": 100,
                        "position_y": 100,
                    },
                    {
                        "node_type": "database",
                        "name": "Get Subscribers",
                        "configuration": {
                            "query": "SELECT * FROM subscribers WHERE active = true",
                            "connection": "main_db",
                        },
                        "position_x": 300,
                        "position_y": 100,
                    },
                    {
                        "node_type": "ai_completion",
                        "name": "Generate Content",
                        "configuration": {
                            "model": "gpt-4",
                            "prompt": "Generate a weekly newsletter with latest updates",
                            "max_tokens": 1000,
                        },
                        "position_x": 500,
                        "position_y": 100,
                    },
                    {
                        "node_type": "email",
                        "name": "Send Newsletter",
                        "configuration": {
                            "template": "newsletter_template",
                            "subject": "Your Weekly Update",
                            "from_email": "newsletter@company.com",
                        },
                        "position_x": 700,
                        "position_y": 100,
                    },
                ],
                "is_public": True,
            },
            {
                "name": "Customer Support Ticket Automation",
                "description": "Automatically categorize, prioritize, and route customer support tickets to the right team members.",
                "category": "automation",
                "workflow_config": {
                    "trigger_type": "webhook",
                    "webhook_url": "/webhooks/support-ticket",
                },
                "node_configs": [
                    {
                        "node_type": "trigger",
                        "name": "New Ticket Webhook",
                        "configuration": {
                            "webhook_url": "/webhooks/support-ticket",
                            "method": "POST",
                        },
                        "position_x": 100,
                        "position_y": 100,
                    },
                    {
                        "node_type": "ai_completion",
                        "name": "Categorize Ticket",
                        "configuration": {
                            "model": "gpt-4",
                            "prompt": "Categorize this support ticket: {{ticket_content}}",
                            "categories": ["technical", "billing", "general", "urgent"],
                        },
                        "position_x": 300,
                        "position_y": 100,
                    },
                    {
                        "node_type": "condition",
                        "name": "Priority Check",
                        "configuration": {
                            "condition": 'category == "urgent"',
                            "true_path": "urgent_notification",
                            "false_path": "normal_routing",
                        },
                        "position_x": 500,
                        "position_y": 100,
                    },
                    {
                        "node_type": "notification",
                        "name": "Urgent Notification",
                        "configuration": {
                            "channel": "slack",
                            "message": "Urgent ticket received: {{ticket_title}}",
                            "recipients": ["#support-urgent"],
                        },
                        "position_x": 700,
                        "position_y": 50,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Assign to Team",
                        "configuration": {
                            "url": "https://api.helpdesk.com/assign",
                            "method": "POST",
                            "body": {
                                "ticket_id": "{{ticket_id}}",
                                "team": "{{category}}",
                            },
                        },
                        "position_x": 700,
                        "position_y": 150,
                    },
                ],
                "is_public": True,
            },
            {
                "name": "Social Media Content Scheduler",
                "description": "Generate and schedule social media posts across multiple platforms with AI-generated content.",
                "category": "ai",
                "workflow_config": {
                    "trigger_type": "scheduled",
                    "schedule": "daily",
                    "timezone": "UTC",
                },
                "node_configs": [
                    {
                        "node_type": "trigger",
                        "name": "Daily Schedule",
                        "configuration": {"schedule_type": "daily", "time": "08:00"},
                        "position_x": 100,
                        "position_y": 100,
                    },
                    {
                        "node_type": "ai_completion",
                        "name": "Generate Post Ideas",
                        "configuration": {
                            "model": "gpt-4",
                            "prompt": "Generate 3 engaging social media post ideas for {{topic}}",
                            "max_tokens": 500,
                        },
                        "position_x": 300,
                        "position_y": 100,
                    },
                    {
                        "node_type": "parallel",
                        "name": "Multi-Platform Posting",
                        "configuration": {
                            "branches": ["twitter", "linkedin", "facebook"]
                        },
                        "position_x": 500,
                        "position_y": 100,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Post to Twitter",
                        "configuration": {
                            "url": "https://api.twitter.com/2/tweets",
                            "method": "POST",
                            "auth": "oauth1",
                            "body": {"text": "{{post_content}}"},
                        },
                        "position_x": 700,
                        "position_y": 50,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Post to LinkedIn",
                        "configuration": {
                            "url": "https://api.linkedin.com/v2/posts",
                            "method": "POST",
                            "auth": "oauth2",
                            "body": {"content": "{{post_content}}"},
                        },
                        "position_x": 700,
                        "position_y": 100,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Post to Facebook",
                        "configuration": {
                            "url": "https://graph.facebook.com/me/feed",
                            "method": "POST",
                            "auth": "oauth2",
                            "body": {"message": "{{post_content}}"},
                        },
                        "position_x": 700,
                        "position_y": 150,
                    },
                ],
                "is_public": True,
            },
            {
                "name": "Data Backup and Sync",
                "description": "Automatically backup important data to multiple cloud storage providers and sync across systems.",
                "category": "data",
                "workflow_config": {
                    "trigger_type": "scheduled",
                    "schedule": "daily",
                    "timezone": "UTC",
                },
                "node_configs": [
                    {
                        "node_type": "trigger",
                        "name": "Daily Backup Schedule",
                        "configuration": {"schedule_type": "daily", "time": "02:00"},
                        "position_x": 100,
                        "position_y": 100,
                    },
                    {
                        "node_type": "database",
                        "name": "Export Database",
                        "configuration": {
                            "connection": "main_db",
                            "export_format": "sql",
                            "tables": ["users", "orders", "products"],
                        },
                        "position_x": 300,
                        "position_y": 100,
                    },
                    {
                        "node_type": "file_process",
                        "name": "Compress Files",
                        "configuration": {
                            "compression": "gzip",
                            "include_timestamp": True,
                        },
                        "position_x": 500,
                        "position_y": 100,
                    },
                    {
                        "node_type": "parallel",
                        "name": "Multi-Cloud Backup",
                        "configuration": {
                            "branches": ["aws_s3", "google_drive", "dropbox"]
                        },
                        "position_x": 700,
                        "position_y": 100,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Upload to AWS S3",
                        "configuration": {
                            "service": "aws_s3",
                            "bucket": "company-backups",
                            "path": "daily/{{date}}",
                        },
                        "position_x": 900,
                        "position_y": 50,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Upload to Google Drive",
                        "configuration": {
                            "service": "google_drive",
                            "folder": "Backups/Daily",
                            "share_with": ["admin@company.com"],
                        },
                        "position_x": 900,
                        "position_y": 100,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Upload to Dropbox",
                        "configuration": {
                            "service": "dropbox",
                            "path": "/Backups/{{date}}",
                        },
                        "position_x": 900,
                        "position_y": 150,
                    },
                ],
                "is_public": True,
            },
            {
                "name": "Lead Qualification and Nurturing",
                "description": "Automatically qualify leads from various sources and nurture them with personalized email sequences.",
                "category": "automation",
                "workflow_config": {
                    "trigger_type": "webhook",
                    "webhook_url": "/webhooks/new-lead",
                },
                "node_configs": [
                    {
                        "node_type": "trigger",
                        "name": "New Lead Webhook",
                        "configuration": {
                            "webhook_url": "/webhooks/new-lead",
                            "method": "POST",
                        },
                        "position_x": 100,
                        "position_y": 100,
                    },
                    {
                        "node_type": "ai_completion",
                        "name": "Score Lead",
                        "configuration": {
                            "model": "gpt-4",
                            "prompt": "Score this lead from 1-10 based on: {{lead_data}}",
                            "scoring_criteria": [
                                "company_size",
                                "industry",
                                "budget",
                                "timeline",
                            ],
                        },
                        "position_x": 300,
                        "position_y": 100,
                    },
                    {
                        "node_type": "condition",
                        "name": "Qualification Check",
                        "configuration": {
                            "condition": "lead_score >= 7",
                            "true_path": "high_value_sequence",
                            "false_path": "nurture_sequence",
                        },
                        "position_x": 500,
                        "position_y": 100,
                    },
                    {
                        "node_type": "email",
                        "name": "High Value Welcome",
                        "configuration": {
                            "template": "high_value_welcome",
                            "subject": "Welcome! Let's schedule a call",
                            "delay": "1 hour",
                        },
                        "position_x": 700,
                        "position_y": 50,
                    },
                    {
                        "node_type": "email",
                        "name": "Nurture Sequence Start",
                        "configuration": {
                            "template": "nurture_welcome",
                            "subject": "Welcome! Here are some resources",
                            "delay": "1 day",
                        },
                        "position_x": 700,
                        "position_y": 150,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Add to CRM",
                        "configuration": {
                            "url": "https://api.crm.com/contacts",
                            "method": "POST",
                            "body": {
                                "email": "{{lead_email}}",
                                "score": "{{lead_score}}",
                                "source": "{{lead_source}}",
                            },
                        },
                        "position_x": 900,
                        "position_y": 100,
                    },
                ],
                "is_public": True,
            },
            {
                "name": "E-commerce Order Processing",
                "description": "Automatically process new orders, update inventory, send confirmations, and trigger fulfillment.",
                "category": "automation",
                "workflow_config": {
                    "trigger_type": "webhook",
                    "webhook_url": "/webhooks/new-order",
                },
                "node_configs": [
                    {
                        "node_type": "trigger",
                        "name": "New Order Webhook",
                        "configuration": {
                            "webhook_url": "/webhooks/new-order",
                            "method": "POST",
                        },
                        "position_x": 100,
                        "position_y": 100,
                    },
                    {
                        "node_type": "database",
                        "name": "Update Inventory",
                        "configuration": {
                            "query": "UPDATE products SET stock = stock - {{quantity}} WHERE id = {{product_id}}",
                            "connection": "inventory_db",
                        },
                        "position_x": 300,
                        "position_y": 100,
                    },
                    {
                        "node_type": "condition",
                        "name": "Payment Status Check",
                        "configuration": {
                            "condition": 'payment_status == "completed"',
                            "true_path": "process_order",
                            "false_path": "payment_failed",
                        },
                        "position_x": 500,
                        "position_y": 100,
                    },
                    {
                        "node_type": "email",
                        "name": "Order Confirmation",
                        "configuration": {
                            "template": "order_confirmation",
                            "subject": "Order Confirmed - #{{order_id}}",
                            "to": "{{customer_email}}",
                        },
                        "position_x": 700,
                        "position_y": 50,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Trigger Fulfillment",
                        "configuration": {
                            "url": "https://api.fulfillment.com/orders",
                            "method": "POST",
                            "body": {
                                "order_id": "{{order_id}}",
                                "items": "{{order_items}}",
                                "shipping_address": "{{shipping_address}}",
                            },
                        },
                        "position_x": 900,
                        "position_y": 50,
                    },
                    {
                        "node_type": "email",
                        "name": "Payment Failed Notice",
                        "configuration": {
                            "template": "payment_failed",
                            "subject": "Payment Issue - Order #{{order_id}}",
                            "to": "{{customer_email}}",
                        },
                        "position_x": 700,
                        "position_y": 150,
                    },
                ],
                "is_public": True,
            },
            {
                "name": "Content Moderation Pipeline",
                "description": "Automatically moderate user-generated content using AI and human review workflows.",
                "category": "ai",
                "workflow_config": {
                    "trigger_type": "webhook",
                    "webhook_url": "/webhooks/content-submitted",
                },
                "node_configs": [
                    {
                        "node_type": "trigger",
                        "name": "Content Submitted",
                        "configuration": {
                            "webhook_url": "/webhooks/content-submitted",
                            "method": "POST",
                        },
                        "position_x": 100,
                        "position_y": 100,
                    },
                    {
                        "node_type": "ai_completion",
                        "name": "AI Content Analysis",
                        "configuration": {
                            "model": "gpt-4",
                            "prompt": "Analyze this content for: toxicity, spam, inappropriate content: {{content}}",
                            "response_format": "json",
                        },
                        "position_x": 300,
                        "position_y": 100,
                    },
                    {
                        "node_type": "condition",
                        "name": "Moderation Decision",
                        "configuration": {
                            "condition": "toxicity_score > 0.8 OR spam_score > 0.9",
                            "true_path": "auto_reject",
                            "false_path": "human_review_check",
                        },
                        "position_x": 500,
                        "position_y": 100,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Auto Reject Content",
                        "configuration": {
                            "url": "https://api.platform.com/content/{{content_id}}/reject",
                            "method": "POST",
                            "reason": "Automated moderation",
                        },
                        "position_x": 700,
                        "position_y": 50,
                    },
                    {
                        "node_type": "condition",
                        "name": "Human Review Needed",
                        "configuration": {
                            "condition": "toxicity_score > 0.5 OR spam_score > 0.6",
                            "true_path": "queue_for_review",
                            "false_path": "auto_approve",
                        },
                        "position_x": 700,
                        "position_y": 150,
                    },
                    {
                        "node_type": "notification",
                        "name": "Queue for Human Review",
                        "configuration": {
                            "channel": "slack",
                            "message": "Content needs review: {{content_id}}",
                            "recipients": ["#moderation-team"],
                        },
                        "position_x": 900,
                        "position_y": 100,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Auto Approve Content",
                        "configuration": {
                            "url": "https://api.platform.com/content/{{content_id}}/approve",
                            "method": "POST",
                            "reason": "Automated approval",
                        },
                        "position_x": 900,
                        "position_y": 200,
                    },
                ],
                "is_public": True,
            },
            {
                "name": "Employee Onboarding Automation",
                "description": "Streamline new employee onboarding with automated account creation, task assignments, and welcome sequences.",
                "category": "automation",
                "workflow_config": {
                    "trigger_type": "webhook",
                    "webhook_url": "/webhooks/new-employee",
                },
                "node_configs": [
                    {
                        "node_type": "trigger",
                        "name": "New Employee Added",
                        "configuration": {
                            "webhook_url": "/webhooks/new-employee",
                            "method": "POST",
                        },
                        "position_x": 100,
                        "position_y": 100,
                    },
                    {
                        "node_type": "parallel",
                        "name": "Account Creation",
                        "configuration": {
                            "branches": ["create_email", "create_slack", "create_jira"]
                        },
                        "position_x": 300,
                        "position_y": 100,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Create Email Account",
                        "configuration": {
                            "url": "https://api.gsuite.com/users",
                            "method": "POST",
                            "body": {
                                "email": "{{first_name}}.{{last_name}}@company.com",
                                "name": "{{full_name}}",
                                "department": "{{department}}",
                            },
                        },
                        "position_x": 500,
                        "position_y": 50,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Add to Slack",
                        "configuration": {
                            "url": "https://api.slack.com/users",
                            "method": "POST",
                            "body": {
                                "email": "{{email}}",
                                "channels": ["#general", "#{{department}}"],
                            },
                        },
                        "position_x": 500,
                        "position_y": 100,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Create Jira Account",
                        "configuration": {
                            "url": "https://api.jira.com/users",
                            "method": "POST",
                            "body": {
                                "email": "{{email}}",
                                "groups": ["employees", "{{department}}"],
                            },
                        },
                        "position_x": 500,
                        "position_y": 150,
                    },
                    {
                        "node_type": "email",
                        "name": "Welcome Email",
                        "configuration": {
                            "template": "employee_welcome",
                            "subject": "Welcome to {{company_name}}!",
                            "to": "{{email}}",
                            "delay": "1 hour",
                        },
                        "position_x": 700,
                        "position_y": 100,
                    },
                    {
                        "node_type": "api_call",
                        "name": "Assign Onboarding Tasks",
                        "configuration": {
                            "url": "https://api.tasks.com/projects/onboarding/tasks",
                            "method": "POST",
                            "body": {
                                "assignee": "{{email}}",
                                "tasks": [
                                    "complete_profile",
                                    "security_training",
                                    "team_intro",
                                ],
                            },
                        },
                        "position_x": 900,
                        "position_y": 100,
                    },
                ],
                "is_public": True,
            },
        ]

        created_count = 0
        for template_data in templates:
            template, created = WorkflowTemplate.objects.get_or_create(
                name=template_data["name"],
                defaults={
                    "description": template_data["description"],
                    "category": template_data["category"],
                    "created_by": system_user,
                    "workflow_config": template_data["workflow_config"],
                    "node_configs": template_data["node_configs"],
                    "is_public": template_data["is_public"],
                },
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created template: {template.name}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Template already exists: {template.name}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {created_count} new templates")
        )
