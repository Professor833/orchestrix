"""
Celery tasks for execution management and cleanup.
"""

import logging
from datetime import timedelta
from celery import shared_task
from django.utils import timezone
from django.db import models
from django.db.models import Count, Avg
from .models import WorkflowExecution, ExecutionMetrics

logger = logging.getLogger(__name__)


@shared_task
def cleanup_old_executions():
    """Clean up old execution records to manage database size."""
    # Delete executions older than 90 days
    cutoff_date = timezone.now() - timedelta(days=90)

    # Keep successful executions for longer, delete failed ones sooner
    old_failed_executions = WorkflowExecution.objects.filter(
        started_at__lt=cutoff_date - timedelta(days=30),
        status__in=["failed", "cancelled", "timeout"],
    )

    old_successful_executions = WorkflowExecution.objects.filter(
        started_at__lt=cutoff_date, status="completed"
    )

    failed_count = old_failed_executions.count()
    successful_count = old_successful_executions.count()

    # Delete old executions
    old_failed_executions.delete()
    old_successful_executions.delete()

    logger.info(
        f"Cleaned up {failed_count} failed and {successful_count} successful old executions"
    )

    return {
        "deleted_failed": failed_count,
        "deleted_successful": successful_count,
        "total_deleted": failed_count + successful_count,
    }


@shared_task
def generate_execution_metrics():
    """Generate daily execution metrics for reporting."""
    today = timezone.now().date()

    # Get all executions from today
    today_executions = WorkflowExecution.objects.filter(started_at__date=today)

    # Group by workflow and user
    workflow_user_groups = today_executions.values("workflow", "user").annotate(
        total=Count("id"),
        successful=Count("id", filter=models.Q(status="completed")),
        failed=Count(
            "id", filter=models.Q(status__in=["failed", "cancelled", "timeout"])
        ),
        avg_duration=Avg("completed_at") - Avg("started_at"),
    )

    metrics_created = 0

    for group in workflow_user_groups:
        # Calculate total duration
        workflow_executions = today_executions.filter(
            workflow_id=group["workflow"],
            user_id=group["user"],
            completed_at__isnull=False,
        )

        total_duration = sum(
            [
                (execution.completed_at - execution.started_at).total_seconds()
                for execution in workflow_executions
            ]
        )

        # Create or update metrics
        metrics, created = ExecutionMetrics.objects.get_or_create(
            workflow_id=group["workflow"],
            user_id=group["user"],
            date=today,
            defaults={
                "total_executions": group["total"],
                "successful_executions": group["successful"],
                "failed_executions": group["failed"],
                "avg_duration": (
                    timedelta(seconds=total_duration / group["total"])
                    if group["total"] > 0
                    else None
                ),
                "total_duration": timedelta(seconds=total_duration),
            },
        )

        if not created:
            # Update existing metrics
            metrics.total_executions = group["total"]
            metrics.successful_executions = group["successful"]
            metrics.failed_executions = group["failed"]
            metrics.avg_duration = (
                timedelta(seconds=total_duration / group["total"])
                if group["total"] > 0
                else None
            )
            metrics.total_duration = timedelta(seconds=total_duration)
            metrics.save()

        metrics_created += 1

    logger.info(f"Generated metrics for {metrics_created} workflow-user combinations")

    return {"date": today.isoformat(), "metrics_generated": metrics_created}


@shared_task
def monitor_long_running_executions():
    """Monitor and handle long-running executions."""
    # Find executions running for more than 1 hour
    timeout_threshold = timezone.now() - timedelta(hours=1)

    long_running = WorkflowExecution.objects.filter(
        status="running", started_at__lt=timeout_threshold
    )

    timed_out_count = 0

    for execution in long_running:
        try:
            # Mark as timed out
            execution.status = "timeout"
            execution.completed_at = timezone.now()
            execution.error_message = "Execution timed out after 1 hour"
            execution.save()

            # Also mark running node executions as timed out
            running_nodes = execution.node_executions.filter(status="running")
            for node_execution in running_nodes:
                node_execution.status = "timeout"
                node_execution.completed_at = timezone.now()
                node_execution.error_message = "Node execution timed out"
                node_execution.save()

            timed_out_count += 1

            logger.warning(f"Marked execution {execution.id} as timed out")

        except Exception as e:
            logger.error(f"Error timing out execution {execution.id}: {str(e)}")

    return {"timed_out_executions": timed_out_count}


@shared_task
def send_execution_notifications(execution_id, notification_type="completed"):
    """Send notifications about execution status changes."""
    try:
        execution = WorkflowExecution.objects.get(id=execution_id)
        user = execution.user

        # Check if user wants notifications
        user_preferences = user.preferences or {}
        if not user_preferences.get("email_notifications", True):
            return {"status": "skipped", "reason": "User disabled notifications"}

        # Prepare notification content
        if notification_type == "completed":
            subject = f"Workflow '{execution.workflow.name}' completed successfully"
            message = f"""
            Your workflow '{execution.workflow.name}' has completed successfully.

            Execution ID: {execution.id}
            Started: {execution.started_at}
            Completed: {execution.completed_at}
            Duration: {execution.duration}

            You can view the results in your dashboard.
            """
        elif notification_type == "failed":
            subject = f"Workflow '{execution.workflow.name}' failed"
            message = f"""
            Your workflow '{execution.workflow.name}' has failed.

            Execution ID: {execution.id}
            Started: {execution.started_at}
            Error: {execution.error_message}

            Please check your workflow configuration and try again.
            """
        else:
            return {"status": "skipped", "reason": "Unknown notification type"}

        # Send email notification
        from django.core.mail import send_mail
        from django.conf import settings

        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )

        logger.info(
            f"Sent {notification_type} notification to {user.email} for execution {execution_id}"
        )

        return {
            "status": "sent",
            "notification_type": notification_type,
            "recipient": user.email,
        }

    except WorkflowExecution.DoesNotExist:
        logger.error(f"Execution {execution_id} not found for notification")
        return {"status": "failed", "reason": "Execution not found"}
    except Exception as e:
        logger.error(
            f"Error sending notification for execution {execution_id}: {str(e)}"
        )
        return {"status": "failed", "reason": str(e)}
