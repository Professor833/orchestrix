# Authentication Patches

This directory contains monkey patches for third-party libraries used in the authentication app. These patches are temporary fixes for compatibility issues, bugs, or deprecation warnings that haven't been addressed upstream yet.

## Why Patches?

We use patches instead of other approaches because:

1. **Non-invasive**: We don't modify the original library code
2. **Maintainable**: Easy to remove when libraries are updated
3. **Isolated**: Contained within our authentication app
4. **Version-controlled**: Changes are tracked and documented

## Current Patches

### jwt_version.py - djangorestframework-simplejwt pkg_resources Fix

**Problem**: `djangorestframework-simplejwt` version 5.3.1 uses the deprecated `pkg_resources` API, which causes deprecation warnings in Python 3.13+:

```
UserWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html.
The pkg_resources package is slated for removal as early as 2025-11-30.
```

**Root Cause**: The library imports `pkg_resources` in its `__init__.py` to check version information:
```python
from pkg_resources import DistributionNotFound, get_distribution
```

**Solution**: Our patch replaces the deprecated `pkg_resources` module with a mock that uses the modern `importlib.metadata` API (available since Python 3.8).

**Impact**: Eliminates deprecation warnings without affecting functionality.

**When to Remove**: When `djangorestframework-simplejwt` is updated to use `importlib.metadata` instead of `pkg_resources`.

## How Patches Work

1. **Import Order**: Patches must be imported before the target library
2. **Module Replacement**: We replace modules in `sys.modules` with our implementations
3. **Interface Compatibility**: Mock modules provide the same interface as the original

## Patch Lifecycle

1. **Identify Issue**: Library has a bug, deprecation warning, or compatibility issue
2. **Create Patch**: Write minimal code to fix the specific issue
3. **Document**: Explain what, why, and when to remove
4. **Monitor**: Watch for upstream fixes
5. **Remove**: Delete patch when library is updated

## Best Practices

- **Minimal patches**: Only fix the specific issue, don't add features
- **Clear documentation**: Explain the problem and solution
- **Version tracking**: Note which library version the patch targets
- **Regular review**: Check if patches are still needed during dependency updates

## Testing

Patches should be tested to ensure:
- The original issue is resolved
- No new issues are introduced
- Functionality remains intact
- Performance is not impacted

## Monitoring

Check these resources for upstream fixes:
- [djangorestframework-simplejwt GitHub](https://github.com/jazzband/djangorestframework-simplejwt)
- [PyPI releases](https://pypi.org/project/djangorestframework-simplejwt/)
- [Changelog](https://django-rest-framework-simplejwt.readthedocs.io/en/latest/changelog.html)