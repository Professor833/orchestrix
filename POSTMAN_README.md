# Orchestrix API Postman Collection

This repository contains a comprehensive Postman collection for the Orchestrix AI Workflow Automation Platform API, including environment configurations for both development and production.

## Files Included

- `Orchestrix_API.postman_collection.json` - Complete API collection with all endpoints
- `Orchestrix_Dev.postman_environment.json` - Development environment variables
- `Orchestrix_Production.postman_environment.json` - Production environment variables

## Quick Start

### 1. Import Collection and Environments

1. Open Postman
2. Click "Import" in the top left
3. Import all three files:
   - `Orchestrix_API.postman_collection.json`
   - `Orchestrix_Dev.postman_environment.json`
   - `Orchestrix_Production.postman_environment.json`

### 2. Select Environment

- Select "Orchestrix - Development" from the environment dropdown for local testing
- Select "Orchestrix - Production" for production API testing

### 3. Authentication

1. First, create a user account using the "Register" request in the Authentication folder
2. Then use the "Login" request to authenticate
3. The login request automatically sets the `authToken` and `refreshToken` variables
4. All subsequent requests will use the bearer token automatically

## API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register/` - Register new user
- `POST /api/v1/auth/login/` - Login user
- `POST /api/v1/auth/refresh/` - Refresh access token
- `GET /api/v1/auth/profile/` - Get user profile
- `GET /api/v1/auth/me/` - Get current user info
- `PATCH /api/v1/auth/change-password/` - Change password

### Workflows
- **Templates**
  - `GET /api/v1/workflows/templates/` - List workflow templates
  - `POST /api/v1/workflows/templates/` - Create template
  - `POST /api/v1/workflows/templates/{id}/use_template/` - Create workflow from template

- **Workflows**
  - `GET /api/v1/workflows/workflows/` - List workflows
  - `POST /api/v1/workflows/workflows/` - Create workflow
  - `GET /api/v1/workflows/workflows/{id}/` - Get workflow details
  - `PATCH /api/v1/workflows/workflows/{id}/` - Update workflow
  - `DELETE /api/v1/workflows/workflows/{id}/` - Delete workflow
  - `POST /api/v1/workflows/workflows/{id}/execute/` - Execute workflow
  - `POST /api/v1/workflows/workflows/{id}/duplicate/` - Duplicate workflow
  - `PATCH /api/v1/workflows/workflows/{id}/toggle_status/` - Toggle active status
  - `GET /api/v1/workflows/workflows/{id}/metrics/` - Get workflow metrics

- **Nodes**
  - `GET /api/v1/workflows/nodes/` - List workflow nodes
  - `POST /api/v1/workflows/nodes/` - Create workflow node

- **Schedules**
  - `GET /api/v1/workflows/schedules/` - List schedules
  - `POST /api/v1/workflows/schedules/` - Create schedule

### Executions
- `GET /api/v1/executions/executions/` - List executions
- `POST /api/v1/executions/executions/` - Create execution
- `GET /api/v1/executions/executions/{id}/` - Get execution details
- `POST /api/v1/executions/executions/{id}/cancel/` - Cancel execution
- `POST /api/v1/executions/executions/{id}/retry/` - Retry failed execution
- `GET /api/v1/executions/executions/stats/` - Get execution statistics

### Integrations
- **Categories**
  - `GET /api/v1/integrations/categories/` - List integration categories

- **Templates**
  - `GET /api/v1/integrations/templates/` - List integration templates

- **Integrations**
  - `GET /api/v1/integrations/integrations/` - List integrations
  - `POST /api/v1/integrations/integrations/` - Create integration
  - `POST /api/v1/integrations/integrations/{id}/test_connection/` - Test connection
  - `POST /api/v1/integrations/integrations/{id}/sync/` - Sync integration data

### System
- `GET /health/` - Health check endpoint
- `GET /api/docs/` - API documentation (Swagger UI)

## Environment Variables

### Development Environment
- `baseUrl`: `http://localhost:8000`
- `frontendUrl`: `http://localhost:3000`
- `environment`: `development`

### Production Environment
- `baseUrl`: `https://api.orchestrix.com`
- `frontendUrl`: `https://app.orchestrix.com`
- `environment`: `production`

### Dynamic Variables
These variables are automatically populated by test scripts or can be set manually:

- `authToken` - JWT access token (set by login request)
- `refreshToken` - JWT refresh token (set by login request)
- `workflowId` - Workflow UUID for testing
- `templateId` - Template UUID for testing
- `executionId` - Execution UUID for testing
- `nodeId` - Node UUID for testing
- `integrationId` - Integration UUID for testing
- `categoryId` - Category UUID for testing
- `webhookId` - Webhook UUID for testing

## Usage Tips

### 1. Authentication Flow
1. Use "Register" to create a new account
2. Use "Login" to get access tokens
3. Tokens are automatically set in environment variables
4. Use "Refresh Token" when access token expires

### 2. Working with Workflows
1. Create a workflow using "Create Workflow"
2. Add nodes using "Create Node" with the workflow ID
3. Execute the workflow using "Execute Workflow"
4. Monitor execution using "List Executions"

### 3. Testing Integrations
1. List available categories with "List Categories"
2. Create integration with "Create Integration"
3. Test connection with "Test Connection"
4. Sync data with "Sync Integration"

### 4. Using Variables
- Copy IDs from response bodies and set them as environment variables
- Use `{{variableName}}` syntax in request URLs and bodies
- Set variables in the "Pre-request Script" tab if needed

## Common Request Examples

### Creating a Workflow
```json
{
  "name": "My Test Workflow",
  "description": "A workflow for testing",
  "status": "draft",
  "is_active": true,
  "trigger_type": "manual",
  "configuration": {
    "timeout": 3600,
    "retry_count": 3
  },
  "trigger_config": {}
}
```

### Creating a Node
```json
{
  "workflow": "{{workflowId}}",
  "node_type": "ai_chat",
  "name": "AI Chat Node",
  "configuration": {
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 1000
  },
  "input_schema": {
    "type": "object",
    "properties": {
      "message": {"type": "string"}
    }
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "response": {"type": "string"}
    }
  },
  "position_x": 100,
  "position_y": 200
}
```

### Executing a Workflow
```json
{
  "trigger_data": {
    "input_message": "Hello, world!",
    "user_id": "123"
  }
}
```

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include details:
```json
{
  "error": "Validation failed",
  "details": {
    "name": ["This field is required."]
  }
}
```

## Authentication

The API uses JWT (JSON Web Token) authentication:
- Access tokens expire in 15 minutes
- Refresh tokens expire in 24 hours
- Include `Authorization: Bearer {token}` header in requests
- Use the refresh endpoint to get new access tokens

## Rate Limiting

The API has rate limiting enabled:
- 100 requests per minute per user
- 429 status code when limit exceeded
- Check `X-RateLimit-*` headers for current limits

## Support

For API support and documentation:
- Swagger UI: `{{baseUrl}}/api/docs/`
- ReDoc: `{{baseUrl}}/api/redoc/`
- Health Check: `{{baseUrl}}/health/`

## Version Information

- API Version: v1
- Collection Version: 1.0.0
- Last Updated: January 2025

---

**Note**: Make sure your local Django server is running on `http://localhost:8000` when using the development environment, and update the production URLs to match your actual deployment.
