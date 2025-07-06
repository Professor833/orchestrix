"""
Celery configuration for orchestrix project.
"""

import os

from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "orchestrix.settings")

app = Celery("orchestrix")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery beat schedule
app.conf.beat_schedule = {
    "cleanup-old-executions": {
        "task": "apps.executions.tasks.cleanup_old_executions",
        "schedule": 60.0 * 60.0 * 24.0,  # Daily
    },
}

# Task routes
app.conf.task_routes = {
    "apps.workflows.tasks.execute_workflow": {"queue": "high_priority"},
    "apps.workflows.tasks.execute_node": {"queue": "high_priority"},
    "apps.integrations.tasks.*": {"queue": "default"},
    "apps.executions.tasks.cleanup_old_executions": {"queue": "low_priority"},
}

# Task configuration
app.conf.update(
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_compression="gzip",
    result_compression="gzip",
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_max_tasks_per_child=1000,
    worker_max_memory_per_child=200000,  # 200MB
)


@app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery."""
    print(f"Request: {self.request!r}")
