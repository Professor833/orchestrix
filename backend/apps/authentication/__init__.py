# Authentication app for user management and JWT auth

"""
Authentication app configuration.

PATCHES:
--------
This module imports patches that must be applied before other imports.
Currently includes:
- jwt_version: Fixes pkg_resources deprecation warnings in djangorestframework-simplejwt

See apps/authentication/patches/README.md for detailed documentation.
"""
from .patches import jwt_version  # Import patch before rest_framework_simplejwt

default_app_config = "apps.authentication.apps.AuthenticationConfig"
