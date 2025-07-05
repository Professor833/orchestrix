'use client'

import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuth } from '@/lib/auth'
import { executionService } from '@/lib/services/executions'
import { useWebSocket } from '@/lib/websocket'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  RotateCcw,
  Square,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface ExecutionDetailsProps {
  executionId: string
}

export function ExecutionDetails({ executionId }: ExecutionDetailsProps) {
  const [showLogs, setShowLogs] = useState(false)
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const { subscribe, connect, disconnect } = useWebSocket()

  const {
    data: execution,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['execution', executionId],
    queryFn: () => executionService.getExecution(executionId),
    refetchInterval: data => {
      // Refetch every 2 seconds if execution is still running
      return data?.status === 'running' ? 2000 : false
    },
  })

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (user && execution && execution.status === 'running') {
      // Note: In a real implementation, you would get the token from auth context
      // For now, we'll simulate the connection
      const unsubscribe = subscribe('execution_update', (data: any) => {
        if (data.execution_id === executionId) {
          refetch()
        }
      })

      return () => {
        unsubscribe()
      }
    }
  }, [user, execution, executionId, subscribe, refetch])

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['execution-logs', executionId],
    queryFn: () => executionService.getExecutionLogs(executionId),
    enabled: showLogs,
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCancel = async () => {
    try {
      await executionService.cancelExecution(executionId)
      refetch()
    } catch (error) {
      console.error('Failed to cancel execution:', error)
    }
  }

  const handleRetry = async () => {
    try {
      await executionService.retryExecution(executionId)
      refetch()
    } catch (error) {
      console.error('Failed to retry execution:', error)
    }
  }

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !execution) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">Failed to load execution details</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Execution Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(execution.status)}
              <h1 className="text-2xl font-bold text-gray-900">
                Execution #{execution.id.slice(0, 8)}
              </h1>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(execution.status)}`}
            >
              {execution.status}
            </span>
          </div>
          <div className="flex space-x-2">
            {execution.status === 'running' && (
              <Button variant="outline" onClick={handleCancel}>
                <Square className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
            {execution.status === 'failed' && (
              <Button variant="outline" onClick={handleRetry}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowLogs(!showLogs)}>
              <Eye className="mr-2 h-4 w-4" />
              {showLogs ? 'Hide' : 'Show'} Logs
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Workflow</h3>
            <p className="mt-1 text-sm text-gray-900">
              {execution.workflow?.name || 'Unknown'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Started</h3>
            <p className="mt-1 text-sm text-gray-900">
              {formatDistanceToNow(new Date(execution.started_at))} ago
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Duration</h3>
            <p className="mt-1 text-sm text-gray-900">
              {execution.completed_at
                ? `${Math.round(
                    (new Date(execution.completed_at).getTime() -
                      new Date(execution.started_at).getTime()) /
                      1000
                  )}s`
                : 'Running...'}
            </p>
          </div>
        </div>

        {execution.error_message && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="text-sm font-medium text-red-800">Error Message</h3>
            <p className="mt-1 text-sm text-red-700">
              {execution.error_message}
            </p>
          </div>
        )}
      </div>

      {/* Execution Steps */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Execution Details
        </h2>
        <div className="space-y-4">
          {/* Simple execution status display */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(execution.status)}
                <span className="font-medium">
                  Current Status: {execution.status}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {execution.completed_at ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>

          {execution.input_data &&
            Object.keys(execution.input_data).length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Input Data
                </h4>
                <pre className="overflow-x-auto rounded border bg-gray-50 p-3 text-xs text-gray-600">
                  {JSON.stringify(execution.input_data, null, 2)}
                </pre>
              </div>
            )}

          {execution.output_data &&
            Object.keys(execution.output_data).length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Output Data
                </h4>
                <pre className="overflow-x-auto rounded border bg-gray-50 p-3 text-xs text-gray-600">
                  {JSON.stringify(execution.output_data, null, 2)}
                </pre>
              </div>
            )}
        </div>
      </div>

      {/* Logs Section */}
      {showLogs && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Execution Logs
            </h2>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
          {logsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="max-h-96 overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100">
              {logs?.map((log, index) => (
                <div key={index} className="flex space-x-4">
                  <span className="flex-shrink-0 text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`flex-shrink-0 ${
                      log.level === 'ERROR'
                        ? 'text-red-400'
                        : log.level === 'WARN'
                          ? 'text-yellow-400'
                          : log.level === 'INFO'
                            ? 'text-blue-400'
                            : 'text-gray-400'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="flex-1">{log.message}</span>
                </div>
              )) || (
                <div className="py-8 text-center text-gray-500">
                  No logs available
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
