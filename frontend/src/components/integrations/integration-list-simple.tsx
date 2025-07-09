'use client'

import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { integrationService } from '@/lib/services/integrations'
import { Integration } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Check,
  MoreHorizontal,
  Plus,
  TestTube,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export function IntegrationListSimple() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null
  )
  const queryClient = useQueryClient()

  // Fetch integrations
  const {
    data: integrations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => integrationService.getIntegrations(),
  })

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: (id: string) => integrationService.testIntegration(id),
    onSuccess: (result, id) => {
      if (result.success) {
        toast.success('Integration test successful!')
        queryClient.invalidateQueries({ queryKey: ['integrations'] })
      } else {
        toast.error('Integration test failed: ' + result.message)
      }
    },
    onError: (error: any) => {
      toast.error(
        'Failed to test integration: ' +
          (error.response?.data?.message || error.message)
      )
    },
  })

  // Toggle integration status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      integrationService.toggleIntegrationStatus(id, isActive),
    onSuccess: (result, { isActive }) => {
      toast.success(
        `Integration ${isActive ? 'enabled' : 'disabled'} successfully!`
      )
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      setSelectedIntegration(null)
    },
    onError: (error: any) => {
      toast.error(
        'Failed to update integration: ' +
          (error.response?.data?.message || error.message)
      )
    },
  })

  // Delete integration mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: (id: string) => integrationService.deleteIntegration(id),
    onSuccess: () => {
      toast.success('Integration deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      setSelectedIntegration(null)
    },
    onError: (error: any) => {
      toast.error(
        'Failed to delete integration: ' +
          (error.response?.data?.message || error.message)
      )
    },
  })

  const handleTestIntegration = (id: string) => {
    testIntegrationMutation.mutate(id)
  }

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: !currentStatus })
  }

  const handleDeleteIntegration = (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this integration? This action cannot be undone.'
      )
    ) {
      deleteIntegrationMutation.mutate(id)
    }
  }

  const getServiceIcon = (serviceType: string): string => {
    const icons: Record<string, string> = {
      ai: '🤖',
      api: '🔗',
      webhook: '🪝',
      oauth: '🔐',
      database: '🗄️',
      email: '📧',
      sms: '📱',
      notification: '🔔',
      file_storage: '📁',
      analytics: '📊',
      other: '⚙️',
    }
    return icons[serviceType] || '⚙️'
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
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Failed to load integrations
        </h3>
        <p className="mb-4 text-gray-500">
          There was an error loading your integrations.
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ['integrations'] })
          }
        >
          Try Again
        </Button>
      </div>
    )
  }

  const integrationsList = integrations?.results || []

  if (integrationsList.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
          <Plus className="h-12 w-12" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No integrations yet
        </h3>
        <p className="mb-4 text-gray-500">
          Get started by adding your first integration.
        </p>
        <Link href="/integrations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Your Integrations
        </h2>
        <Link href="/integrations/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {integrationsList.map((integration: Integration) => (
          <div
            key={integration.id}
            className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
                  {getServiceIcon(integration.service_type)}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {integration.display_name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {integration.category_name}
                  </p>
                  {integration.is_verified && (
                    <div className="mt-1 flex items-center">
                      <Check className="mr-1 h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${integration.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setSelectedIntegration(
                        selectedIntegration === integration.id
                          ? null
                          : integration.id
                      )
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {selectedIntegration === integration.id && (
                    <div className="absolute right-0 top-8 z-10 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                      <button
                        onClick={() => handleTestIntegration(integration.id)}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={testIntegrationMutation.isPending}
                      >
                        <TestTube className="mr-2 h-4 w-4" />
                        Test Connection
                      </button>
                      <button
                        onClick={() =>
                          handleToggleStatus(
                            integration.id,
                            integration.is_active
                          )
                        }
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={toggleStatusMutation.isPending}
                      >
                        {integration.is_active ? (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Disable
                          </>
                        ) : (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Enable
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteIntegration(integration.id)}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        disabled={deleteIntegrationMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {integration.last_used
                  ? `Last used ${new Date(integration.last_used).toLocaleDateString()}`
                  : 'Never used'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
