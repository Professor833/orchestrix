"""
Django management command to populate integration categories and templates.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.integrations.models import IntegrationCategory, IntegrationTemplate


class Command(BaseCommand):
    help = "Populate integration categories and templates"

    def handle(self, *args, **options):
        self.stdout.write("Populating integration categories and templates...")

        with transaction.atomic():
            # Create categories
            categories = [
                {
                    "name": "Productivity",
                    "description": "Tools for productivity and collaboration",
                    "icon": "📋",
                    "color": "#10B981",
                },
                {
                    "name": "Content",
                    "description": "Content creation and management platforms",
                    "icon": "📝",
                    "color": "#8B5CF6",
                },
                {
                    "name": "Analytics",
                    "description": "Data analytics and insights platforms",
                    "icon": "📊",
                    "color": "#F59E0B",
                },
                {
                    "name": "Communication",
                    "description": "Communication and messaging services",
                    "icon": "💬",
                    "color": "#3B82F6",
                },
                {
                    "name": "Storage",
                    "description": "File storage and cloud services",
                    "icon": "☁️",
                    "color": "#EF4444",
                },
            ]

            created_categories = {}
            for cat_data in categories:
                category, created = IntegrationCategory.objects.get_or_create(
                    name=cat_data["name"],
                    defaults={
                        "description": cat_data["description"],
                        "icon": cat_data["icon"],
                        "color": cat_data["color"],
                    },
                )
                created_categories[cat_data["name"]] = category
                if created:
                    self.stdout.write(f"Created category: {category.name}")
                else:
                    self.stdout.write(f"Category already exists: {category.name}")

            # Create integration templates
            templates = [
                {
                    "name": "Notion",
                    "category": "Productivity",
                    "service_name": "notion",
                    "service_type": "oauth",
                    "description": "Connect to Notion to manage pages, databases, and blocks",
                    "icon": "🔗",
                    "documentation_url": "https://developers.notion.com/",
                    "setup_instructions": """
                        1. Go to https://www.notion.so/my-integrations
                        2. Click "New integration"
                        3. Give your integration a name and select associated workspace
                        4. Copy the "Internal Integration Token"
                        5. Share your Notion pages/databases with your integration
                    """.strip(),
                    "credential_schema": {
                        "type": "object",
                        "properties": {
                            "api_key": {
                                "type": "string",
                                "title": "API Key",
                                "description": "Your Notion integration token",
                                "required": True,
                            }
                        },
                        "required": ["api_key"],
                    },
                    "configuration_schema": {
                        "type": "object",
                        "properties": {
                            "workspace_id": {
                                "type": "string",
                                "title": "Workspace ID",
                                "description": "Notion workspace ID (optional)",
                                "required": False,
                            },
                            "default_database_id": {
                                "type": "string",
                                "title": "Default Database ID",
                                "description": "Default database to use for operations",
                                "required": False,
                            },
                        },
                    },
                },
                {
                    "name": "Google Sheets",
                    "category": "Productivity",
                    "service_name": "google_sheets",
                    "service_type": "oauth",
                    "description": "Connect to Google Sheets to read and write spreadsheet data",
                    "icon": "📊",
                    "documentation_url": "https://developers.google.com/sheets/api",
                    "setup_instructions": """
                        1. Go to Google Cloud Console
                        2. Create a new project or select existing one
                        3. Enable Google Sheets API
                        4. Create credentials (OAuth 2.0 client ID)
                        5. Download the credentials JSON file
                        6. Copy the client ID and client secret
                    """.strip(),
                    "credential_schema": {
                        "type": "object",
                        "properties": {
                            "client_id": {
                                "type": "string",
                                "title": "Client ID",
                                "description": "Google OAuth client ID",
                                "required": True,
                            },
                            "client_secret": {
                                "type": "string",
                                "title": "Client Secret",
                                "description": "Google OAuth client secret",
                                "required": True,
                            },
                        },
                        "required": ["client_id", "client_secret"],
                    },
                    "configuration_schema": {
                        "type": "object",
                        "properties": {
                            "default_spreadsheet_id": {
                                "type": "string",
                                "title": "Default Spreadsheet ID",
                                "description": "Default spreadsheet to use for operations",
                                "required": False,
                            },
                            "scopes": {
                                "type": "array",
                                "title": "Scopes",
                                "description": "Google Sheets API scopes",
                                "default": ["https://www.googleapis.com/auth/spreadsheets"],
                                "items": {"type": "string"},
                            },
                        },
                    },
                },
                {
                    "name": "YouTube",
                    "category": "Content",
                    "service_name": "youtube",
                    "service_type": "oauth",
                    "description": "Connect to YouTube to manage videos, playlists, and channel data",
                    "icon": "🎥",
                    "documentation_url": "https://developers.google.com/youtube/v3",
                    "setup_instructions": """
                            1. Go to Google Cloud Console
                            2. Create a new project or select existing one
                            3. Enable YouTube Data API v3
                            4. Create credentials (OAuth 2.0 client ID)
                            5. Add authorized redirect URIs
                            6. Copy the client ID and client secret
                    """.strip(),
                    "credential_schema": {
                        "type": "object",
                        "properties": {
                            "client_id": {
                                "type": "string",
                                "title": "Client ID",
                                "description": "Google OAuth client ID",
                                "required": True,
                            },
                            "client_secret": {
                                "type": "string",
                                "title": "Client Secret",
                                "description": "Google OAuth client secret",
                                "required": True,
                            },
                        },
                        "required": ["client_id", "client_secret"],
                    },
                    "configuration_schema": {
                        "type": "object",
                        "properties": {
                            "default_channel_id": {
                                "type": "string",
                                "title": "Default Channel ID",
                                "description": "Default YouTube channel ID",
                                "required": False,
                            },
                            "scopes": {
                                "type": "array",
                                "title": "Scopes",
                                "description": "YouTube API scopes",
                                "default": [
                                    "https://www.googleapis.com/auth/youtube.readonly",
                                    "https://www.googleapis.com/auth/youtube.upload",
                                ],
                                "items": {"type": "string"},
                            },
                        },
                    },
                },
            ]

            for template_data in templates:
                category = created_categories[template_data["category"]]
                template, created = IntegrationTemplate.objects.get_or_create(
                    name=template_data["name"],
                    service_name=template_data["service_name"],
                    defaults={
                        "category": category,
                        "service_type": template_data["service_type"],
                        "description": template_data["description"],
                        "icon": template_data["icon"],
                        "documentation_url": template_data["documentation_url"],
                        "setup_instructions": template_data["setup_instructions"],
                        "credential_schema": template_data["credential_schema"],
                        "configuration_schema": template_data["configuration_schema"],
                        "is_active": True,
                    },
                )
                if created:
                    self.stdout.write(f"Created template: {template.name}")
                else:
                    self.stdout.write(f"Template already exists: {template.name}")

        self.stdout.write(self.style.SUCCESS("Successfully populated integration data!"))
