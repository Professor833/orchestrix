'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { workflowService } from '@/lib/services'
import { Workflow } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Code,
  Database,
  Play,
  Save,
  Settings,
  Trash2,
  Zap,
} from 'lucide-react'
import { Route } from 'next'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface WorkflowBuilderNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'output'
  name: string
  description: string
  config: Record<string, any>
  position: { x: number; y: number }
}

const nodeTypes = [
  {
    type: 'trigger',
    name: 'Trigger',
    icon: Zap,
    color: 'bg-green-100 text-green-600',
  },
  {
    type: 'action',
    name: 'Action',
    icon: Settings,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    type: 'condition',
    name: 'Condition',
    icon: Code,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    type: 'output',
    name: 'Output',
    icon: Database,
    color: 'bg-purple-100 text-purple-600',
  },
]

export default function WorkflowEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()

  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [nodes, setNodes] = useState<WorkflowBuilderNode[]>([])
  const [selectedNode, setSelectedNode] = useState<WorkflowBuilderNode | null>(
    null
  )

  const {
    data: workflow,
    isLoading,
    isError,
    error,
  } = useQuery<Workflow, Error>({
    queryKey: ['workflow', id],
    queryFn: () => workflowService.getWorkflow(id),
    enabled: !!id,
  })

  // Load workflow data into the builder
  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name)
      setWorkflowDescription(workflow.description)

      // Convert WorkflowNode[] to WorkflowBuilderNode[]
      const builderNodes: WorkflowBuilderNode[] = workflow.nodes.map(
        (node, index) => ({
          id: node.id,
          type: mapNodeType(node.node_type),
          name: node.name,
          description: node.description,
          config: node.configuration,
          position: {
            x: node.position_x || 100 + index * 220,
            y: node.position_y || 100,
          },
        })
      )

      setNodes(builderNodes)
    }
  }, [workflow])

  // Map backend node types to builder node types
  const mapNodeType = (
    nodeType: string
  ): 'trigger' | 'action' | 'condition' | 'output' => {
    switch (nodeType) {
      case 'trigger':
        return 'trigger'
      case 'condition':
        return 'condition'
      case 'ai_chat':
      case 'ai_completion':
      case 'api_call':
      case 'webhook':
      case 'email':
      case 'sms':
      case 'notification':
      case 'data_transform':
      case 'file_process':
      case 'database':
      case 'action':
      case 'loop':
      case 'parallel':
      case 'merge':
      case 'custom':
        return 'action'
      default:
        return 'output'
    }
  }

  const updateWorkflowMutation = useMutation<Workflow, Error, any>({
    mutationFn: (data: any) => workflowService.updateWorkflow(id, data),
    onSuccess: () => {
      toast.success('Workflow updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['workflow', id] })
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
    onError: (error: any) => {
      toast.error('Failed to update workflow', {
        description: error.response?.data?.detail || error.message,
      })
    },
  })

  const addNode = (type: WorkflowBuilderNode['type']) => {
    const newNode: WorkflowBuilderNode = {
      id: `node-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodes.length + 1}`,
      description: '',
      config: {},
      position: { x: 100 + nodes.length * 220, y: 100 },
    }
    setNodes([...nodes, newNode])
  }

  const removeNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
  }

  const updateNode = (
    nodeId: string,
    updates: Partial<WorkflowBuilderNode>
  ) => {
    setNodes(
      nodes.map(node => (node.id === nodeId ? { ...node, ...updates } : node))
    )
    if (selectedNode?.id === nodeId) {
      setSelectedNode({ ...selectedNode, ...updates })
    }
  }

  const handleSave = async () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name')
      return
    }

    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      configuration: {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          name: node.name,
          description: node.description,
          config: node.config,
          position: node.position,
        })),
      },
    }

    updateWorkflowMutation.mutate(workflowData)
  }

  const handleTest = async () => {
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load workflow. {error?.message}
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex w-80 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/workflows/${id}` as Route)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workflow
            </Button>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Workflow Name"
            />
            <textarea
              value={workflowDescription}
              onChange={e => setWorkflowDescription(e.target.value)}
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Workflow Description"
              rows={3}
            />
          </div>
        </div>

        {/* Node Types */}
        <div className="border-b border-gray-200 p-4">
          <h3 className="mb-3 font-semibold">Add Nodes</h3>
          <div className="space-y-2">
            {nodeTypes.map(nodeType => {
              const Icon = nodeType.icon
              return (
                <button
                  key={nodeType.type}
                  onClick={() =>
                    addNode(nodeType.type as WorkflowBuilderNode['type'])
                  }
                  className={`flex w-full items-center rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300 ${nodeType.color}`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="font-medium">{nodeType.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Node Properties */}
        {selectedNode && (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="mb-3 font-semibold">Node Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={e =>
                    updateNode(selectedNode.id, { name: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={selectedNode.description}
                  onChange={e =>
                    updateNode(selectedNode.id, { description: e.target.value })
                  }
                  className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={selectedNode.type}
                  onChange={e =>
                    updateNode(selectedNode.id, {
                      type: e.target.value as WorkflowBuilderNode['type'],
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {nodeTypes.map(nodeType => (
                    <option key={nodeType.type} value={nodeType.type}>
                      {nodeType.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              disabled={updateWorkflowMutation.isPending}
              className="flex-1"
            >
              {updateWorkflowMutation.isPending ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
            <Button onClick={handleTest} variant="outline" className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Test
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gray-50">
          <div className="relative h-full w-full">
            {/* Grid background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />

            {/* Nodes */}
            {nodes.map(node => {
              const nodeTypeConfig = nodeTypes.find(nt => nt.type === node.type)
              const Icon = nodeTypeConfig?.icon || Settings

              return (
                <div
                  key={node.id}
                  className={`absolute cursor-pointer rounded-lg border-2 bg-white shadow-lg transition-all duration-200 ${
                    selectedNode?.id === node.id
                      ? 'border-blue-500 shadow-xl'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: '200px',
                    minHeight: '100px',
                  }}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div
                        className={`flex items-center ${nodeTypeConfig?.color || 'bg-gray-100 text-gray-600'} rounded px-2 py-1 text-xs font-medium`}
                      >
                        <Icon className="mr-1 h-3 w-3" />
                        {node.type}
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          removeNode(node.id)
                        }}
                        className="text-red-500 transition-colors hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <h4 className="mb-1 truncate text-sm font-semibold">
                      {node.name}
                    </h4>
                    <p className="line-clamp-2 text-xs text-gray-600">
                      {node.description || 'No description'}
                    </p>
                  </div>
                </div>
              )
            })}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-gray-400">
                    <Settings className="mx-auto h-16 w-16" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-600">
                    No nodes yet
                  </h3>
                  <p className="max-w-md text-gray-500">
                    Add nodes from the sidebar to start building your workflow
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
