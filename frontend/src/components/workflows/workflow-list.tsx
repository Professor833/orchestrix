'use client'

import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { workflowService } from '@/lib/services/workflows'
import { Workflow } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Copy, Edit, Pause, Play, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function WorkflowList() {
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: workflowsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['workflows', { page: currentPage }],
    queryFn: () =>
      workflowService.getWorkflows({
        page: currentPage,
        page_size: 10,
      }),
  })

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

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await workflowService.executeWorkflow(workflowId)
      // Show success message
    } catch (error) {
      console.error('Failed to execute workflow:', error)
    }
  }

  const handleToggleStatus = async (workflow: Workflow) => {
    try {
      await workflowService.toggleWorkflowStatus(
        workflow.id,
        !workflow.is_active
      )
      // Refresh data
    } catch (error) {
      console.error('Failed to toggle workflow status:', error)
    }
  }

  const handleCloneWorkflow = async (workflowId: string) => {
    try {
      await workflowService.cloneWorkflow(workflowId)
      // Refresh data
    } catch (error) {
      console.error('Failed to clone workflow:', error)
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
        <p className="text-red-600">Failed to load workflows</p>
      </div>
    )
  }

  if (!workflowsData?.results || workflowsData.results.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new workflow.
        </p>
        <div className="mt-6">
          <Link href="/workflows/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {workflowsData.results.map(workflow => (
            <li key={workflow.id}>
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <svg
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {workflow.name}
                      </p>
                      <span
                        className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(workflow.status)}`}
                      >
                        {workflow.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {workflow.description}
                    </p>
                    <div className="mt-1 flex items-center text-xs text-gray-400">
                      <span>{workflow.node_count} nodes</span>
                      <span className="mx-2">•</span>
                      <span>v{workflow.version}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Updated{' '}
                        {formatDistanceToNow(new Date(workflow.updated_at))} ago
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExecuteWorkflow(workflow.id)}
                    title="Execute workflow"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStatus(workflow)}
                    title={
                      workflow.is_active
                        ? 'Pause workflow'
                        : 'Activate workflow'
                    }
                  >
                    {workflow.is_active ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCloneWorkflow(workflow.id)}
                    title="Clone workflow"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Link href={`/workflows/${workflow.id}/edit`}>
                    <Button variant="ghost" size="icon" title="Edit workflow">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" title="Delete workflow">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {workflowsData && workflowsData.count > 10 && (
        <div className="flex items-center justify-between">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              disabled={!workflowsData.previous}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!workflowsData.next}
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
                  {Math.min(10, workflowsData.count)}
                </span>{' '}
                of <span className="font-medium">{workflowsData.count}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                <Button
                  variant="outline"
                  disabled={!workflowsData.previous}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={!workflowsData.next}
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
