'use client'

import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { executionService } from '@/lib/services/executions'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  RotateCcw,
  Square,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function ExecutionList() {
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: executionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['executions', { page: currentPage }],
    queryFn: () =>
      executionService.getExecutions({
        page: currentPage,
        page_size: 10,
      }),
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
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

  const handleCancelExecution = async (executionId: string) => {
    try {
      await executionService.cancelExecution(executionId)
      // Refresh data
    } catch (error) {
      console.error('Failed to cancel execution:', error)
    }
  }

  const handleRetryExecution = async (executionId: string) => {
    try {
      await executionService.retryExecution(executionId)
      // Refresh data
    } catch (error) {
      console.error('Failed to retry execution:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">Failed to load executions</p>
      </div>
    )
  }

  if (!executionsData?.results || executionsData.results.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <Clock className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No executions
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No workflow executions found.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {executionsData.results.map(execution => (
            <li key={execution.id}>
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      {getStatusIcon(execution.status)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {execution.workflow_name}
                      </p>
                      <span
                        className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(execution.status)}`}
                      >
                        {execution.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Execution #{execution.id.slice(0, 8)}
                    </p>
                    <div className="mt-1 flex items-center text-xs text-gray-400">
                      <span>
                        Started{' '}
                        {formatDistanceToNow(new Date(execution.started_at))}{' '}
                        ago
                      </span>
                      {execution.completed_at && (
                        <>
                          <span className="mx-2">•</span>
                          <span>
                            Duration:{' '}
                            {Math.round(
                              (new Date(execution.completed_at).getTime() -
                                new Date(execution.started_at).getTime()) /
                                1000
                            )}
                            s
                          </span>
                        </>
                      )}
                      {execution.error_message && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-red-600">
                            {execution.error_message}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link href={`/executions/${execution.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View execution details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {execution.status === 'running' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCancelExecution(execution.id)}
                      title="Cancel execution"
                    >
                      <Square className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                  {execution.status === 'failed' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRetryExecution(execution.id)}
                      title="Retry execution"
                    >
                      <RotateCcw className="h-4 w-4 text-blue-600" />
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {executionsData && executionsData.count > 10 && (
        <div className="flex items-center justify-between">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              disabled={!executionsData.previous}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!executionsData.next}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">
                  {Math.min(10, executionsData.count)}
                </span>{' '}
                of <span className="font-medium">{executionsData.count}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                <Button
                  variant="outline"
                  disabled={!executionsData.previous}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={!executionsData.next}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
