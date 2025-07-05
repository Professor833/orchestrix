'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  Book,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Globe,
  Key,
  Play,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface ApiEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  summary: string
  description: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  requestBody?: {
    type: string
    example: any
  }
  responses: Array<{
    status: number
    description: string
    example: any
  }>
  category: string
}

const apiEndpoints: ApiEndpoint[] = [
  {
    id: 'auth-login',
    method: 'POST',
    path: '/auth/login',
    summary: 'User Login',
    description: 'Authenticate a user and receive access tokens',
    category: 'Authentication',
    requestBody: {
      type: 'application/json',
      example: {
        email: 'user@example.com',
        password: 'password123',
      },
    },
    responses: [
      {
        status: 200,
        description: 'Login successful',
        example: {
          message: 'Login successful',
          user: {
            id: '123',
            email: 'user@example.com',
            first_name: 'John',
            last_name: 'Doe',
          },
          tokens: {
            access: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
            refresh: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
          },
        },
      },
      {
        status: 400,
        description: 'Invalid credentials',
        example: {
          email: ['This field is required.'],
          password: ['This field is required.'],
        },
      },
    ],
  },
  {
    id: 'workflows-list',
    method: 'GET',
    path: '/workflows',
    summary: 'List Workflows',
    description: 'Retrieve a list of workflows for the authenticated user',
    category: 'Workflows',
    parameters: [
      {
        name: 'page',
        type: 'integer',
        required: false,
        description: 'Page number for pagination',
      },
      {
        name: 'search',
        type: 'string',
        required: false,
        description: 'Search term to filter workflows',
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter by workflow status (active, paused, draft)',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'List of workflows',
        example: {
          count: 25,
          next: '/workflows?page=2',
          previous: null,
          results: [
            {
              id: '456',
              name: 'Email Campaign',
              description: 'Automated email marketing campaign',
              status: 'active',
              created_at: '2024-01-01T00:00:00Z',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'workflows-create',
    method: 'POST',
    path: '/workflows',
    summary: 'Create Workflow',
    description: 'Create a new workflow',
    category: 'Workflows',
    requestBody: {
      type: 'application/json',
      example: {
        name: 'My New Workflow',
        description: 'A description of my workflow',
        configuration: {
          nodes: [],
          edges: [],
        },
        is_active: false,
      },
    },
    responses: [
      {
        status: 201,
        description: 'Workflow created successfully',
        example: {
          id: '789',
          name: 'My New Workflow',
          description: 'A description of my workflow',
          status: 'draft',
          created_at: '2024-01-15T10:30:00Z',
        },
      },
    ],
  },
  {
    id: 'executions-list',
    method: 'GET',
    path: '/executions',
    summary: 'List Executions',
    description: 'Retrieve a list of workflow executions',
    category: 'Executions',
    parameters: [
      {
        name: 'workflow_id',
        type: 'string',
        required: false,
        description: 'Filter by workflow ID',
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter by execution status',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'List of executions',
        example: {
          count: 10,
          results: [
            {
              id: '101',
              workflow: {
                id: '456',
                name: 'Email Campaign',
              },
              status: 'completed',
              started_at: '2024-01-15T09:00:00Z',
              completed_at: '2024-01-15T09:05:00Z',
            },
          ],
        },
      },
    ],
  },
]

const categories = [
  'All',
  'Authentication',
  'Workflows',
  'Executions',
  'Integrations',
  'Users',
]

export function ApiDocumentation() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(
    new Set()
  )
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [schemaError, setSchemaError] = useState<boolean>(false)

  // Error handling for schema loading
  if (schemaError) {
    return (
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>API Schema Unavailable</AlertTitle>
        <AlertDescription>
          The API schema could not be loaded. This documentation is still
          available in static mode. Please check if the API server is running or
          use the Swagger/ReDoc links above for interactive documentation.
        </AlertDescription>
      </Alert>
    )
  }

  const filteredEndpoints = apiEndpoints.filter(
    endpoint =>
      selectedCategory === 'All' || endpoint.category === selectedCategory
  )

  const toggleEndpoint = (endpointId: string) => {
    const newExpanded = new Set(expandedEndpoints)
    if (newExpanded.has(endpointId)) {
      newExpanded.delete(endpointId)
    } else {
      newExpanded.add(endpointId)
    }
    setExpandedEndpoints(newExpanded)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800'
      case 'POST':
        return 'bg-blue-100 text-blue-800'
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      case 'PATCH':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    setTestingEndpoint(endpoint.id)

    // Simulate API call
    setTimeout(() => {
      setTestResults({
        ...testResults,
        [endpoint.id]: {
          status: 200,
          data: endpoint.responses[0].example,
          timestamp: new Date().toISOString(),
        },
      })
      setTestingEndpoint(null)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center space-x-4">
          <div className="rounded-full bg-blue-100 p-3">
            <Book className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Orchestrix API
            </h2>
            <p className="text-gray-600">RESTful API for workflow automation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Base URL</p>
              <code className="text-sm text-gray-600">
                https://api.orchestrix.com/v1
              </code>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Key className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Authentication
              </p>
              <p className="text-sm text-gray-600">Bearer Token</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Content Type</p>
              <p className="text-sm text-gray-600">application/json</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* API Endpoints */}
      <div className="space-y-4">
        {filteredEndpoints.map(endpoint => (
          <div
            key={endpoint.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white"
          >
            <div
              className="cursor-pointer p-4 transition-colors hover:bg-gray-50"
              onClick={() => toggleEndpoint(endpoint.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {expandedEndpoints.has(endpoint.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getMethodColor(endpoint.method)}`}
                    >
                      {endpoint.method}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {endpoint.summary}
                    </h3>
                    <code className="text-sm text-gray-600">
                      {endpoint.path}
                    </code>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation()
                    testEndpoint(endpoint)
                  }}
                  disabled={testingEndpoint === endpoint.id}
                >
                  {testingEndpoint === endpoint.id ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Test
                    </>
                  )}
                </Button>
              </div>
            </div>

            {expandedEndpoints.has(endpoint.id) && (
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600">
                      {endpoint.description}
                    </p>
                  </div>

                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-900">
                        Parameters
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                Name
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                Type
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                Required
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {endpoint.parameters.map(param => (
                              <tr key={param.name}>
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                  {param.name}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500">
                                  {param.type}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500">
                                  {param.required ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-600" />
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500">
                                  {param.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {endpoint.requestBody && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          Request Body
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(
                                endpoint.requestBody?.example,
                                null,
                                2
                              )
                            )
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                        {JSON.stringify(endpoint.requestBody.example, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Responses
                    </h4>
                    <div className="space-y-3">
                      {endpoint.responses.map(response => (
                        <div
                          key={response.status}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  response.status >= 200 &&
                                  response.status < 300
                                    ? 'bg-green-100 text-green-800'
                                    : response.status >= 400
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {response.status}
                              </span>
                              <span className="text-sm text-gray-600">
                                {response.description}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  JSON.stringify(response.example, null, 2)
                                )
                              }
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
                            {JSON.stringify(response.example, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>

                  {testResults[endpoint.id] && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-900">
                        Test Result
                      </h4>
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="mb-2 flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Status: {testResults[endpoint.id].status}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(
                              testResults[endpoint.id].timestamp
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                        <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
                          {JSON.stringify(
                            testResults[endpoint.id].data,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
