'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { workflowService } from '@/lib/services'
import { Workflow, WorkflowExecution } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  BrainCircuit,
  Calendar,
  Clock,
  Code,
  Edit,
  Play,
  Settings,
  Workflow as WorkflowIcon,
} from 'lucide-react'
import { Route } from 'next'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'trigger':
      return <WorkflowIcon className="h-5 w-5 text-blue-500" />
    case 'action':
      return <BrainCircuit className="h-5 w-5 text-green-500" />
    case 'condition':
      return <Code className="h-5 w-5 text-purple-500" />
    case 'ai_chat':
    case 'ai_completion':
      return <BrainCircuit className="h-5 w-5 text-indigo-500" />
    case 'api_call':
      return <Code className="h-5 w-5 text-orange-500" />
    case 'webhook':
      return <Settings className="h-5 w-5 text-cyan-500" />
    default:
      return <WorkflowIcon className="h-5 w-5 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'archived':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getExecutionStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'running':
      return 'bg-blue-100 text-blue-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function WorkflowDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const {
    data: workflow,
    isLoading: isLoadingWorkflow,
    isError: isWorkflowError,
    error: workflowError,
  } = useQuery<Workflow, Error>({
    queryKey: ['workflow', id],
    queryFn: () => workflowService.getWorkflow(id),
    enabled: !!id,
  })

  const { data: executionsData, isLoading: isLoadingExecutions } = useQuery<
    { results: WorkflowExecution[] },
    Error
  >({
    queryKey: ['workflowExecutions', id],
    queryFn: () => workflowService.getWorkflowExecutions(id),
    enabled: !!id,
  })

  const handleExecuteWorkflow = async () => {
    if (!workflow) return

    try {
      await workflowService.executeWorkflow(workflow.id)
      toast.success('Workflow execution started!')
    } catch (error: any) {
      toast.error('Failed to execute workflow', {
        description: error.response?.data?.detail || error.message,
      })
    }
  }

  const handleToggleStatus = async () => {
    if (!workflow) return

    try {
      await workflowService.toggleWorkflowStatus(
        workflow.id,
        !workflow.is_active
      )
      toast.success(`Workflow ${workflow.is_active ? 'paused' : 'activated'}!`)
    } catch (error: any) {
      toast.error('Failed to update workflow status', {
        description: error.response?.data?.detail || error.message,
      })
    }
  }

  if (isLoadingWorkflow) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isWorkflowError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load workflow. {workflowError?.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The requested workflow could not be found.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workflows
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleExecuteWorkflow}
            disabled={workflow.status === 'archived'}
          >
            <Play className="mr-2 h-4 w-4" />
            Execute
          </Button>
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={workflow.status === 'archived'}
          >
            {workflow.is_active ? 'Pause' : 'Activate'}
          </Button>
          <Button
            onClick={() =>
              router.push(`/workflows/${workflow.id}/edit` as Route)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Workflow
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <WorkflowIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {workflow.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {workflow.trigger_type} trigger • {workflow.node_count} nodes •
                v{workflow.version}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(workflow.status)}>
              {workflow.status}
            </Badge>
            {workflow.is_active && (
              <Badge
                variant="outline"
                className="border-green-200 bg-green-50 text-green-700"
              >
                Active
              </Badge>
            )}
          </div>
        </div>

        <p className="mb-4 max-w-3xl text-gray-600">
          {workflow.description || 'No description provided'}
        </p>

        <div className="flex flex-wrap gap-2">
          {workflow.category && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {workflow.category}
            </Badge>
          )}
          {workflow.tags &&
            workflow.tags.length > 0 &&
            workflow.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <p className="text-sm">{workflow.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Trigger Type
                    </label>
                    <p className="text-sm">{workflow.trigger_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Node Count
                    </label>
                    <p className="text-sm">{workflow.node_count}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Version
                    </label>
                    <p className="text-sm">v{workflow.version}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created
                  </label>
                  <p className="flex items-center text-sm">
                    <Calendar className="mr-1 h-4 w-4" />
                    {formatDistanceToNow(new Date(workflow.created_at))} ago
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Updated
                  </label>
                  <p className="flex items-center text-sm">
                    <Clock className="mr-1 h-4 w-4" />
                    {formatDistanceToNow(new Date(workflow.updated_at))} ago
                  </p>
                </div>
                {workflow.last_run_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Last Run
                    </label>
                    <p className="flex items-center text-sm">
                      <Play className="mr-1 h-4 w-4" />
                      {formatDistanceToNow(new Date(workflow.last_run_at))} ago
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trigger Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Type
                    </label>
                    <p className="text-sm">{workflow.trigger_type}</p>
                  </div>
                  {workflow.trigger_config &&
                    Object.keys(workflow.trigger_config).length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Configuration
                        </label>
                        <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                          {JSON.stringify(workflow.trigger_config, null, 2)}
                        </pre>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nodes">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Nodes</CardTitle>
              <CardDescription>
                The building blocks of your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflow.nodes && workflow.nodes.length > 0 ? (
                  workflow.nodes.map((node, index) => (
                    <div
                      key={node.id}
                      className="flex items-start space-x-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="mt-1 flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                          {getNodeIcon(node.node_type)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="truncate font-semibold text-gray-900">
                            {node.name}
                          </h3>
                          <div className="ml-2 flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {node.node_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                          {node.description || 'No description provided'}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <svg
                                className="mr-1 h-3 w-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              ({node.position_x}, {node.position_y})
                            </span>
                            <span className="flex items-center">
                              <svg
                                className="mr-1 h-3 w-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {formatDistanceToNow(new Date(node.updated_at))}{' '}
                              ago
                            </span>
                          </div>
                          {node.node_type === 'trigger' && (
                            <Badge
                              variant="secondary"
                              className="bg-green-50 text-xs text-green-700"
                            >
                              Entry Point
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <WorkflowIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No nodes configured
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add nodes to your workflow to get started.
                    </p>
                    <div className="mt-6">
                      <Button
                        onClick={() =>
                          router.push(`/workflows/${workflow.id}/edit` as Route)
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Workflow
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>
                Recent executions of this workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingExecutions ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : executionsData?.results &&
                executionsData.results.length > 0 ? (
                <div className="space-y-4">
                  {executionsData.results.map(execution => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Play className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              Execution {execution.id.slice(-8)}
                            </span>
                            <Badge
                              className={getExecutionStatusColor(
                                execution.status
                              )}
                            >
                              {execution.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            Started{' '}
                            {formatDistanceToNow(
                              new Date(execution.started_at)
                            )}{' '}
                            ago
                            {execution.completed_at && (
                              <span>
                                {' '}
                                • Completed{' '}
                                {formatDistanceToNow(
                                  new Date(execution.completed_at)
                                )}{' '}
                                ago
                              </span>
                            )}
                          </div>
                          {execution.error_message && (
                            <div className="mt-1 text-sm text-red-600">
                              Error: {execution.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {execution.trigger_source}
                        </Badge>
                        {execution.duration && (
                          <Badge variant="secondary">
                            {execution.duration}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Play className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No executions yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This workflow hasn't been executed yet.
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleExecuteWorkflow}>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Workflow
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
              <CardDescription>
                Configuration and advanced settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-medium">
                    General Configuration
                  </h3>
                  {workflow.configuration &&
                  Object.keys(workflow.configuration).length > 0 ? (
                    <pre className="overflow-x-auto rounded bg-gray-50 p-4 text-sm">
                      {JSON.stringify(workflow.configuration, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No configuration data available.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/workflows/${workflow.id}/edit` as Route)
                      }
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Workflow
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleToggleStatus}
                      disabled={workflow.status === 'archived'}
                    >
                      {workflow.is_active ? 'Pause' : 'Activate'}
                    </Button>
                    <Button variant="outline" disabled>
                      <Settings className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button variant="outline" disabled>
                      Clone
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
