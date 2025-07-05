'use client'

import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { workflowService } from '@/lib/services/workflows'
import { Workflow } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { WorkflowCard } from './workflow-card'

export function WorkflowList() {
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  const {
    data: workflowsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['workflows', { page: currentPage }],
    queryFn: () =>
      workflowService.getWorkflows({
        page: currentPage,
        page_size: 12,
      }),
    staleTime: 0, // Always refetch to get fresh data
    gcTime: 0, // Don't cache the data (renamed from cacheTime in newer versions)
  })

  const executeWorkflowMutation = useMutation({
    mutationFn: (workflowId: string) =>
      workflowService.executeWorkflow(workflowId),
    onSuccess: () => {
      toast.success('Workflow execution started!')
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
    onError: (error: any) => {
      toast.error('Failed to execute workflow', {
        description: error.response?.data?.detail || error.message,
      })
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({
      workflowId,
      isActive,
    }: {
      workflowId: string
      isActive: boolean
    }) => workflowService.toggleWorkflowStatus(workflowId, isActive),
    onSuccess: (_, { isActive }) => {
      toast.success(`Workflow ${isActive ? 'activated' : 'paused'}!`)
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
    onError: (error: any) => {
      toast.error('Failed to update workflow status', {
        description: error.response?.data?.detail || error.message,
      })
    },
  })

  const cloneWorkflowMutation = useMutation({
    mutationFn: (workflowId: string) =>
      workflowService.cloneWorkflow(workflowId),
    onSuccess: () => {
      toast.success('Workflow cloned successfully!')
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
    onError: (error: any) => {
      toast.error('Failed to clone workflow', {
        description: error.response?.data?.detail || error.message,
      })
    },
  })

  const handleExecuteWorkflow = (workflowId: string) => {
    executeWorkflowMutation.mutate(workflowId)
  }

  const handleToggleStatus = (workflow: Workflow) => {
    toggleStatusMutation.mutate({
      workflowId: workflow.id,
      isActive: !workflow.is_active,
    })
  }

  const handleCloneWorkflow = (workflowId: string) => {
    cloneWorkflowMutation.mutate(workflowId)
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {workflowsData.results.map(workflow => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onExecute={handleExecuteWorkflow}
            onToggleStatus={handleToggleStatus}
            onClone={handleCloneWorkflow}
          />
        ))}
      </div>

      {/* Pagination */}
      {workflowsData && workflowsData.count > 12 && (
        <div className="mt-8 flex items-center justify-between">
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
                  {Math.min(12, workflowsData.count)}
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
