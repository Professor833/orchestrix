'use client'

import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { workflowService } from '@/lib/services'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Bell,
  Bot,
  ChevronDown,
  Clock,
  Copy,
  Database,
  Eye,
  Play,
  Search,
  Settings,
  Tag,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface WorkflowTemplateWithDetails {
  id: string
  name: string
  description: string
  category: string
  created_by_email?: string
  workflow_config: Record<string, any>
  node_configs: Array<Record<string, any>>
  is_public: boolean
  usage_count: number
  created_at: string
  updated_at?: string
}

const categoryIcons: Record<string, any> = {
  ai: Bot,
  data: Database,
  automation: Zap,
  integration: Workflow,
  notification: Bell,
  utility: Settings,
  custom: Tag,
}

const categoryColors: Record<string, string> = {
  ai: 'bg-purple-100 text-purple-800',
  data: 'bg-blue-100 text-blue-800',
  automation: 'bg-green-100 text-green-800',
  integration: 'bg-orange-100 text-orange-800',
  notification: 'bg-yellow-100 text-yellow-800',
  utility: 'bg-gray-100 text-gray-800',
  custom: 'bg-pink-100 text-pink-800',
}

export default function WorkflowTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('usage_count')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplateWithDetails | null>(null)
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')

  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch workflow templates
  const {
    data: templatesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['workflow-templates', searchTerm, selectedCategory, sortBy],
    queryFn: () =>
      workflowService.getWorkflowTemplates({
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        ordering:
          sortBy === 'usage_count'
            ? '-usage_count'
            : sortBy === 'created_at'
              ? '-created_at'
              : sortBy,
      }),
  })

  // Create workflow from template mutation
  const createFromTemplateMutation = useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: string
      data: { name: string; description?: string }
    }) => workflowService.createWorkflowFromTemplate(templateId, data),
    onSuccess: workflow => {
      toast.success('Workflow created successfully!')
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      setShowCreateModal(false)
      setSelectedTemplate(null)
      setWorkflowName('')
      setWorkflowDescription('')
      router.push(`/workflows/${workflow.id}/edit` as any)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create workflow')
    },
  })

  const templates = templatesResponse?.results || []

  const categories = [
    { value: 'all', label: 'All Templates', count: templates.length },
    {
      value: 'ai',
      label: 'AI & ML',
      count: templates.filter(t => t.category === 'ai').length,
    },
    {
      value: 'data',
      label: 'Data Processing',
      count: templates.filter(t => t.category === 'data').length,
    },
    {
      value: 'automation',
      label: 'Automation',
      count: templates.filter(t => t.category === 'automation').length,
    },
    {
      value: 'integration',
      label: 'Integration',
      count: templates.filter(t => t.category === 'integration').length,
    },
    {
      value: 'notification',
      label: 'Notification',
      count: templates.filter(t => t.category === 'notification').length,
    },
    {
      value: 'utility',
      label: 'Utility',
      count: templates.filter(t => t.category === 'utility').length,
    },
    {
      value: 'custom',
      label: 'Custom',
      count: templates.filter(t => t.category === 'custom').length,
    },
  ]

  const handleCreateFromTemplate = (template: WorkflowTemplateWithDetails) => {
    setSelectedTemplate(template)
    setWorkflowName(`${template.name} - Copy`)
    setWorkflowDescription(template.description)
    setShowCreateModal(true)
  }

  const handleSubmitCreate = () => {
    if (!selectedTemplate || !workflowName.trim()) return

    createFromTemplateMutation.mutate({
      templateId: selectedTemplate.id,
      data: {
        name: workflowName.trim(),
        description: workflowDescription.trim() || undefined,
      },
    })
  }

  const getNodeTypeCount = (nodeConfigs: Array<Record<string, any>>) => {
    const types = nodeConfigs.reduce((acc: Record<string, number>, node) => {
      const type = node.node_type
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
    return types
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

  if (error) {
    return (
      <RouteGuard requireAuth={true}>
        <DashboardShell>
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-red-500">
              <Workflow className="h-12 w-12" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Failed to load templates
            </h3>
            <p className="mb-4 text-gray-500">
              There was an error loading workflow templates.
            </p>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ['workflow-templates'],
                })
              }
            >
              Try Again
            </Button>
          </div>
        </DashboardShell>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="Workflow Templates"
          text="Choose from pre-built templates to quickly create powerful workflows"
        >
          <Link href="/workflows">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workflows
            </Button>
          </Link>
        </DashboardHeader>

        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-8 focus:border-blue-500 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-8 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="usage_count">Most Popular</option>
                <option value="created_at">Newest</option>
                <option value="name">Name</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Templates Grid */}
          {templates.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No templates found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map(template => {
                const CategoryIcon = categoryIcons[template.category] || Tag
                const nodeTypes = getNodeTypeCount(template.node_configs)

                return (
                  <div
                    key={template.id}
                    className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`rounded-lg p-2 ${categoryColors[template.category] || categoryColors.custom}`}
                        >
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="line-clamp-1 font-medium text-gray-900">
                            {template.name}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${categoryColors[template.category] || categoryColors.custom}`}
                          >
                            {template.category.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      {template.usage_count > 0 && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="mr-1 h-4 w-4" />
                          {template.usage_count}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                      {template.description}
                    </p>

                    {/* Node Info */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Workflow className="mr-1 h-4 w-4" />
                        {template.node_configs.length} nodes
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1 h-4 w-4" />
                        {new Date(template.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Node Types */}
                    <div className="mb-4 flex flex-wrap gap-1">
                      {Object.entries(nodeTypes)
                        .slice(0, 3)
                        .map(([type, count]) => (
                          <span
                            key={type}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {type} ({count})
                          </span>
                        ))}
                      {Object.keys(nodeTypes).length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                          +{Object.keys(nodeTypes).length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleCreateFromTemplate(template)}
                        className="flex-1"
                        disabled={createFromTemplateMutation.isPending}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Use Template
                      </Button>
                      <Link href={`/workflows/templates/${template.id}` as any}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>

                    {/* Creator */}
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-500">
                        Created by{' '}
                        {(template as any).created_by_email || 'System'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Create Workflow Modal */}
        {showCreateModal && selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h2 className="mb-4 text-lg font-medium text-gray-900">
                Create Workflow from Template
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Workflow Name *
                  </label>
                  <input
                    type="text"
                    value={workflowName}
                    onChange={e => setWorkflowName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter workflow name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={workflowDescription}
                    onChange={e => setWorkflowDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter workflow description"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setSelectedTemplate(null)
                    setWorkflowName('')
                    setWorkflowDescription('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitCreate}
                  disabled={
                    !workflowName.trim() || createFromTemplateMutation.isPending
                  }
                >
                  {createFromTemplateMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Create Workflow
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </RouteGuard>
  )
}
