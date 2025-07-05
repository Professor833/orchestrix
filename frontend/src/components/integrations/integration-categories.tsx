'use client'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { integrationService } from '@/lib/services/integrations'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'

interface IntegrationCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export function IntegrationCategories() {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['integration-categories'],
    queryFn: () => integrationService.getIntegrationCategories(),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
        <p className="text-sm text-gray-500">Failed to load categories</p>
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-gray-500">No categories available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Integration Categories
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category: IntegrationCategory) => (
          <div
            key={category.id}
            className="flex cursor-pointer flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300"
          >
            <div
              className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: category.color + '20' }}
            >
              <span style={{ color: category.color }} className="text-lg">
                {category.icon || '📁'}
              </span>
            </div>
            <h3 className="text-center text-sm font-medium text-gray-900">
              {category.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  )
}
