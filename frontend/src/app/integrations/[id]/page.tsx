'use client'

import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { integrationService } from '@/lib/services/integrations'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Check,
  Settings,
  TestTube,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function IntegrationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const integrationId = params.id as string

  // Fetch integration details
  const {
    data: integration,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['integration', integrationId],
    queryFn: () => integrationService.getIntegration(integrationId),
    enabled: !!integrationId,
  })

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: () => integrationService.testIntegration(integrationId),
    onSuccess: result => {
      if (result.success) {
        toast.success('Integration test successful!')
        queryClient.invalidateQueries({
          queryKey: ['integration', integrationId],
        })
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
    mutationFn: (isActive: boolean) =>
      integrationService.toggleIntegrationStatus(integrationId, isActive),
    onSuccess: (result, isActive) => {
      toast.success(
        `Integration ${isActive ? 'enabled' : 'disabled'} successfully!`
      )
      queryClient.invalidateQueries({
        queryKey: ['integration', integrationId],
      })
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
    mutationFn: () => integrationService.deleteIntegration(integrationId),
    onSuccess: () => {
      toast.success('Integration deleted successfully!')
      router.push('/integrations')
    },
    onError: (error: any) => {
      toast.error(
        'Failed to delete integration: ' +
          (error.response?.data?.message || error.message)
      )
    },
  })

  const handleTestIntegration = () => {
    testIntegrationMutation.mutate()
  }

  const handleToggleStatus = () => {
    if (integration) {
      toggleStatusMutation.mutate(!integration.is_active)
    }
  }

  const handleDeleteIntegration = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this integration? This action cannot be undone.'
      )
    ) {
      deleteIntegrationMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <RouteGuard requireAuth={true}>
        <DashboardShell>
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardShell>
      </RouteGuard>
    )
  }

  if (error || !integration) {
    return (
      <RouteGuard requireAuth={true}>
        <DashboardShell>
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Integration not found
            </h3>
            <p className="mb-4 text-gray-500">
              The integration you're looking for doesn't exist or has been
              deleted.
            </p>
            <Link href="/integrations">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Integrations
              </Button>
            </Link>
          </div>
        </DashboardShell>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading={integration.display_name || integration.service_name}
          text={
            integration.description ||
            `Manage your ${integration.service_name} integration`
          }
        >
          <div className="flex items-center space-x-2">
            <Link href="/integrations">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button
              onClick={handleTestIntegration}
              disabled={testIntegrationMutation.isPending}
              variant="outline"
            >
              {testIntegrationMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <TestTube className="mr-2 h-4 w-4" />
              )}
              Test Connection
            </Button>
            <Button
              onClick={handleToggleStatus}
              disabled={toggleStatusMutation.isPending}
              variant={integration.is_active ? 'outline' : 'default'}
            >
              {toggleStatusMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : integration.is_active ? (
                <ToggleLeft className="mr-2 h-4 w-4" />
              ) : (
                <ToggleRight className="mr-2 h-4 w-4" />
              )}
              {integration.is_active ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </DashboardHeader>

        <div className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-center">
                <div
                  className={`rounded-lg p-2 ${integration.is_active ? 'bg-green-100' : 'bg-gray-100'}`}
                >
                  {integration.is_active ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p
                    className={`text-sm ${integration.is_active ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    {integration.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-center">
                <div
                  className={`rounded-lg p-2 ${integration.is_verified ? 'bg-blue-100' : 'bg-yellow-100'}`}
                >
                  {integration.is_verified ? (
                    <Check className="h-5 w-5 text-blue-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Verification
                  </p>
                  <p
                    className={`text-sm ${integration.is_verified ? 'text-blue-600' : 'text-yellow-600'}`}
                  >
                    {integration.is_verified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Usage</p>
                  <p className="text-sm text-gray-500">
                    {integration.usage_count || 0} times
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Details */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Integration Details
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Service Name
                </label>
                <p className="text-sm text-gray-900">
                  {integration.service_name}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Service Type
                </label>
                <p className="text-sm capitalize text-gray-900">
                  {integration.service_type}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <p className="text-sm text-gray-900">
                  {integration.display_name}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Created
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(integration.created_at).toLocaleDateString()}
                </p>
              </div>
              {integration.last_used && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Last Used
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(integration.last_used).toLocaleDateString()}
                  </p>
                </div>
              )}
              {integration.expires_at && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Expires
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(integration.expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            {integration.description && (
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="text-sm text-gray-900">
                  {integration.description}
                </p>
              </div>
            )}
          </div>

          {/* Configuration */}
          {integration.configuration &&
            Object.keys(integration.configuration).length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Configuration
                </h3>
                <div className="space-y-3">
                  {Object.entries(integration.configuration).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium capitalize text-gray-700">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-gray-900">
                          {typeof value === 'boolean'
                            ? value
                              ? 'Yes'
                              : 'No'
                            : String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link href={`/integrations/${integration.id}/edit` as any}>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </Link>
              <Button
                onClick={handleDeleteIntegration}
                disabled={deleteIntegrationMutation.isPending}
                variant="destructive"
              >
                {deleteIntegrationMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Integration
              </Button>
            </div>
          </div>
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
