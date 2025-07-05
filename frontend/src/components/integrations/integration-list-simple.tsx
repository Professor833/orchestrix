'use client'

import { Button } from '@/components/ui/button'
import {
  Check,
  MoreHorizontal,
  Plus,
  Settings,
  TestTube,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

// Mock data for demonstration - will be replaced with API calls
const mockIntegrations = [
  {
    id: '1',
    service_name: 'slack',
    service_type: 'notification',
    display_name: 'Slack Notifications',
    description: 'Send messages and notifications to Slack channels',
    is_active: true,
    is_verified: true,
    usage_count: 42,
    created_at: '2024-01-15T10:00:00Z',
    last_used: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    service_name: 'google_sheets',
    service_type: 'database',
    display_name: 'Google Sheets',
    description: 'Read and write data to Google Sheets',
    is_active: true,
    is_verified: true,
    usage_count: 28,
    created_at: '2024-01-10T09:00:00Z',
    last_used: '2024-01-19T16:45:00Z',
  },
  {
    id: '3',
    service_name: 'openai',
    service_type: 'ai',
    display_name: 'OpenAI GPT',
    description: 'Generate text and perform AI tasks',
    is_active: false,
    is_verified: false,
    usage_count: 0,
    created_at: '2024-01-18T11:00:00Z',
    last_used: null,
  },
]

interface Integration {
  id: string
  service_name: string
  service_type: string
  display_name: string
  description: string
  is_active: boolean
  is_verified: boolean
  usage_count: number
  created_at: string
  last_used: string | null
}

export function IntegrationListSimple() {
  const [integrations, setIntegrations] =
    useState<Integration[]>(mockIntegrations)
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null
  )
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const handleTestIntegration = async (id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }))

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const integration = integrations.find(i => i.id === id)
    if (integration) {
      if (integration.is_verified) {
        toast.success('Integration test successful!')
      } else {
        toast.error('Integration test failed - please check your configuration')
      }
    }

    setLoading(prev => ({ ...prev, [id]: false }))
  }

  const handleToggleStatus = async (id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }))

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id
          ? { ...integration, is_active: !integration.is_active }
          : integration
      )
    )

    const integration = integrations.find(i => i.id === id)
    toast.success(
      `Integration ${integration?.is_active ? 'disabled' : 'enabled'} successfully!`
    )

    setLoading(prev => ({ ...prev, [id]: false }))
    setSelectedIntegration(null)
  }

  const handleDeleteIntegration = async (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this integration? This action cannot be undone.'
      )
    ) {
      setLoading(prev => ({ ...prev, [id]: true }))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setIntegrations(prev => prev.filter(integration => integration.id !== id))
      toast.success('Integration deleted successfully!')

      setLoading(prev => ({ ...prev, [id]: false }))
      setSelectedIntegration(null)
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

  if (integrations.length === 0) {
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {integrations.map(integration => (
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
                <p className="mt-1 text-xs capitalize text-gray-500">
                  {integration.service_type}
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
                  disabled={loading[integration.id]}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>

                {selectedIntegration === integration.id && (
                  <div className="absolute right-0 top-8 z-10 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    <button
                      onClick={() => handleTestIntegration(integration.id)}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      disabled={loading[integration.id]}
                    >
                      <TestTube className="mr-2 h-4 w-4" />
                      Test Connection
                    </button>
                    <button
                      onClick={() => handleToggleStatus(integration.id)}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      disabled={loading[integration.id]}
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
                    <Link href={`/integrations/${integration.id}`}>
                      <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteIntegration(integration.id)}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      disabled={loading[integration.id]}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            {integration.description}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  integration.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {integration.is_active ? 'Active' : 'Inactive'}
              </span>
              {integration.is_verified && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  Verified
                </span>
              )}
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">
                Used {integration.usage_count} times
              </p>
              {integration.last_used && (
                <p className="text-xs text-gray-500">
                  Last: {new Date(integration.last_used).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
