"""
Celery tasks for workflow execution.
"""

import logging

from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import Workflow, WorkflowNode

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task(bind=True)
def execute_workflow(self, workflow_id, user_id, input_data=None, trigger_source="manual"):
    """Execute a complete workflow."""
    try:
        workflow = Workflow.objects.get(id=workflow_id)
        user = User.objects.get(id=user_id)

        logger.info(f"Starting workflow execution: {workflow.name} for user {user.email}")

        # Create workflow execution record
        from apps.executions.models import WorkflowExecution

        execution = WorkflowExecution.objects.create(
            workflow=workflow,
            user=user,
            status="running",
            input_data=input_data or {},
            trigger_source=trigger_source,
            execution_context={
                "task_id": self.request.id,
                "started_by": "celery_worker",
            },
        )

        # Get workflow nodes in execution order
        nodes = workflow.nodes.filter(parent_node__isnull=True).order_by("position_x", "position_y")

        results = {}
        current_data = input_data or {}

        # Execute each node
        for node in nodes:
            try:
                logger.info(f"Executing node: {node.name}")

                # Execute the node
                node_result = execute_node.delay(execution.id, node.id, current_data).get()  # Wait for node completion

                if node_result["status"] == "completed":
                    results[str(node.id)] = node_result["output"]
                    current_data.update(node_result["output"])
                elif node_result["status"] == "failed":
                    # Node failed, mark execution as failed
                    execution.mark_as_failed(f"Node {node.name} failed: {node_result.get('error', 'Unknown error')}")
                    return {
                        "status": "failed",
                        "error": f"Node {node.name} failed",
                        "execution_id": str(execution.id),
                    }

            except Exception as e:
                logger.error(f"Error executing node {node.name}: {str(e)}")
                execution.mark_as_failed(f"Error executing node {node.name}: {str(e)}")
                return {
                    "status": "failed",
                    "error": str(e),
                    "execution_id": str(execution.id),
                }

        # Mark execution as completed
        execution.mark_as_completed(results)

        logger.info(f"Workflow execution completed: {workflow.name}")

        return {
            "status": "completed",
            "results": results,
            "execution_id": str(execution.id),
        }

    except Workflow.DoesNotExist:
        logger.error(f"Workflow with id {workflow_id} not found")
        return {
            "status": "failed",
            "error": f"Workflow with id {workflow_id} not found",
        }
    except User.DoesNotExist:
        logger.error(f"User with id {user_id} not found")
        return {"status": "failed", "error": f"User with id {user_id} not found"}
    except Exception as e:
        logger.error(f"Unexpected error in workflow execution: {str(e)}")
        return {"status": "failed", "error": str(e)}


@shared_task(bind=True)
def execute_node(self, execution_id, node_id, input_data):
    """Execute a single workflow node."""
    try:
        from apps.executions.models import NodeExecution, WorkflowExecution

        execution = WorkflowExecution.objects.get(id=execution_id)
        node = WorkflowNode.objects.get(id=node_id)

        logger.info(f"Executing node: {node.name} of type: {node.node_type}")

        # Create node execution record
        node_execution = NodeExecution.objects.create(
            workflow_execution=execution,
            node=node,
            status="running",
            input_data=input_data,
        )

        # Log start
        node_execution.add_log("info", f"Started executing node: {node.name}")

        # Execute based on node type
        output_data = {}

        if node.node_type == "trigger":
            output_data = _execute_trigger_node(node, input_data, node_execution)
        elif node.node_type == "ai_chat":
            output_data = _execute_ai_chat_node(node, input_data, node_execution)
        elif node.node_type == "api_call":
            output_data = _execute_api_call_node(node, input_data, node_execution)
        elif node.node_type == "email":
            output_data = _execute_email_node(node, input_data, node_execution)
        elif node.node_type == "condition":
            output_data = _execute_condition_node(node, input_data, node_execution)
        else:
            # Default action for unknown node types
            output_data = {
                "message": f"Executed {node.node_type} node: {node.name}",
                "node_type": node.node_type,
                "timestamp": timezone.now().isoformat(),
            }

        # Mark node execution as completed
        node_execution.mark_as_completed(output_data)
        node_execution.add_log("info", f"Completed executing node: {node.name}")

        return {
            "status": "completed",
            "output": output_data,
            "node_execution_id": str(node_execution.id),
        }

    except Exception as e:
        logger.error(f"Error executing node: {str(e)}")

        # Mark node execution as failed if it exists
        try:
            node_execution.mark_as_failed(str(e))
            node_execution.add_log("error", f"Failed executing node: {str(e)}")
        except Exception as e:
            logger.error(f"Error marking node execution as failed: {str(e)}")
            pass

        return {"status": "failed", "error": str(e)}


def _execute_trigger_node(node, input_data, node_execution):
    """Execute a trigger node."""
    node_execution.add_log("info", "Trigger node executed - workflow started")
    return {"triggered_at": timezone.now().isoformat(), "trigger_data": input_data}


def _execute_ai_chat_node(node, input_data, node_execution):
    """Execute an AI chat node."""
    # For MVP, we'll just simulate AI response
    # In production, this would call actual AI APIs
    config = node.configuration
    prompt = config.get("prompt", "Hello, how can I help you?")

    node_execution.add_log("info", f"AI Chat prompt: {prompt}")

    # Simulate AI response
    response = f"AI Response to: {prompt}"

    return {
        "ai_response": response,
        "prompt_used": prompt,
        "model": config.get("model", "gpt-3.5-turbo"),
    }


def _execute_api_call_node(node, input_data, node_execution):
    """Execute an API call node."""
    import requests

    config = node.configuration
    url = config.get("url")
    method = config.get("method", "GET").upper()
    headers = config.get("headers", {})

    node_execution.add_log("info", f"Making {method} request to {url}")

    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            data = config.get("body", {})
            response = requests.post(url, json=data, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        response.raise_for_status()

        return {
            "status_code": response.status_code,
            "response_data": (
                response.json()
                if response.headers.get("content-type", "").startswith("application/json")
                else response.text
            ),
            "url": url,
            "method": method,
        }

    except Exception as e:
        node_execution.add_log("error", f"API call failed: {str(e)}")
        raise


def _execute_email_node(node, input_data, node_execution):
    """Execute an email node."""
    from django.conf import settings
    from django.core.mail import send_mail

    config = node.configuration
    to_email = config.get("to_email")
    subject = config.get("subject", "Workflow Notification")
    message = config.get("message", "This is a notification from your workflow.")

    node_execution.add_log("info", f"Sending email to {to_email}")

    try:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [to_email],
            fail_silently=False,
        )

        return {
            "email_sent": True,
            "to_email": to_email,
            "subject": subject,
            "sent_at": timezone.now().isoformat(),
        }

    except Exception as e:
        node_execution.add_log("error", f"Email sending failed: {str(e)}")
        raise


def _execute_condition_node(node, input_data, node_execution):
    """Execute a condition node."""
    config = node.configuration
    condition = config.get("condition", "true")

    # Simple condition evaluation (for MVP)
    # In production, use a proper expression evaluator
    if condition.lower() in ["true", "1", "yes"]:
        result = True
    elif condition.lower() in ["false", "0", "no"]:
        result = False
    else:
        # Try to evaluate as a simple expression
        try:
            result = eval(condition, {"__builtins__": {}}, input_data)
        except Exception as e:
            logger.error(f"Error evaluating condition: {str(e)}")
            result = False

    node_execution.add_log("info", f"Condition '{condition}' evaluated to: {result}")

    return {
        "condition_result": result,
        "condition": condition,
        "evaluated_at": timezone.now().isoformat(),
    }
