"""
Patches package for authentication app.

This package contains monkey patches for third-party libraries used in the
authentication app. These patches fix compatibility issues, bugs, or deprecation
warnings that haven't been addressed upstream yet.

IMPORTANT:
----------
Patches must be imported BEFORE the target libraries they modify.
The authentication app's __init__.py handles this automatically.

CURRENT PATCHES:
----------------
- jwt_version: Fixes pkg_resources deprecation warnings in djangorestframework-simplejwt

See README.md for detailed documentation and maintenance guidelines.
"""
