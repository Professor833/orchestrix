# Patches Changelog

This file tracks all patches applied to third-party libraries, when they were added, and when they should be removed.

## [2025-01-05] - JWT pkg_resources Fix

### Added
- **Patch**: `apps.authentication.patches.jwt_version`
- **Target**: `djangorestframework-simplejwt==5.3.1`
- **Issue**: pkg_resources deprecation warnings in Python 3.13+
- **Solution**: Replace pkg_resources with importlib.metadata mock

### Details
- **Problem**: Library uses deprecated `pkg_resources` API
- **Warning**: `pkg_resources is deprecated as an API... slated for removal as early as 2025-11-30`
- **Root Cause**: `from pkg_resources import DistributionNotFound, get_distribution` in library's `__init__.py`
- **Impact**: Eliminates deprecation warnings without affecting functionality
- **Compatibility**: Python 3.8+ (uses importlib.metadata)

### Monitoring
- **GitHub**: https://github.com/jazzband/djangorestframework-simplejwt
- **PyPI**: https://pypi.org/project/djangorestframework-simplejwt/
- **Remove When**: Library is updated to use importlib.metadata instead of pkg_resources

### Testing
- [x] Deprecation warnings eliminated
- [x] JWT authentication still works
- [x] Token generation/validation functional
- [x] No performance impact observed

---

## Template for Future Patches

```markdown
## [YYYY-MM-DD] - Brief Description

### Added
- **Patch**: `path.to.patch.module`
- **Target**: `library-name==version`
- **Issue**: Brief description of the problem
- **Solution**: Brief description of the fix

### Details
- **Problem**: Detailed problem description
- **Root Cause**: What causes the issue
- **Impact**: What the patch accomplishes
- **Compatibility**: Version requirements

### Monitoring
- **GitHub**: Link to repository
- **PyPI**: Link to PyPI page
- **Remove When**: Condition for removing the patch

### Testing
- [ ] Issue resolved
- [ ] No regressions
- [ ] Performance acceptable
```