"""
Monkey patch for djangorestframework-simplejwt to fix pkg_resources deprecation warnings.  # noqa: E501

PROBLEM:
--------
djangorestframework-simplejwt version 5.3.1 uses the deprecated pkg_resources API,
which causes deprecation warnings in Python 3.13+:

    UserWarning: pkg_resources is deprecated as an API. See
    https://setuptools.pypa.io/en/latest/pkg_resources.html.
    The pkg_resources package is slated for removal as early as 2025-11-30.

ROOT CAUSE:
-----------
The library imports pkg_resources in its __init__.py:
    from pkg_resources import DistributionNotFound, get_distribution

SOLUTION:
---------
This patch replaces the deprecated pkg_resources module with a mock that uses
the modern importlib.metadata API (available since Python 3.8).

USAGE:
------
This patch must be imported BEFORE importing rest_framework_simplejwt.
It's automatically imported in apps.authentication.__init__.py.

WHEN TO REMOVE:
---------------
Remove this patch when djangorestframework-simplejwt is updated to use
importlib.metadata instead of pkg_resources.

COMPATIBILITY:
--------------
- Python 3.8+ (uses importlib.metadata)
- djangorestframework-simplejwt 5.3.1
- Tested with Python 3.13

CREATED: 2025-01-05
AUTHOR: Authentication Team
"""

import sys
from importlib import metadata


def get_version(package_name):
    try:
        return metadata.version(package_name)
    except metadata.PackageNotFoundError:
        return None


# Monkey patch pkg_resources functions
sys.modules["pkg_resources"] = type(
    "MockPkgResources",
    (),
    {
        "DistributionNotFound": type("DistributionNotFound", (Exception,), {}),
        "get_distribution": lambda name: type(
            "MockDist", (), {"version": get_version(name)}
        )(),
    },
)
