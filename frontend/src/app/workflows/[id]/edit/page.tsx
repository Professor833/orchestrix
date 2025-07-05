'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { workflowService } from '@/lib/services'
import { Workflow } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
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
        connections: [], // TODO: Add connection logic
      },
    }

    updateWorkflowMutation.mutate(workflowData)
  }

  const handleTest = async () => {
    if (!workflow) return

    try {
      await workflowService.executeWorkflow(workflow.id)
      toast.success('Test execution started!')
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push(`/workflows/${id}` as Route)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workflow
        </Button>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleTest}>
            <Play className="mr-2 h-4 w-4" />
            Test Workflow
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateWorkflowMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateWorkflowMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Edit Workflow</h1>
        <p className="text-gray-600">
          Make changes to your workflow configuration and nodes.
        </p>
      </div>

      <div className="flex h-[800px] overflow-hidden rounded-lg border border-gray-200 bg-white">
        {/* Left Sidebar - Workflow Settings */}
        <div className="w-80 overflow-y-auto border-r border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Workflow Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    value={workflowName}
                    onChange={e => setWorkflowName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter workflow name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={workflowDescription}
                    onChange={e => setWorkflowDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what this workflow does"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Add Nodes
              </h3>
              <div className="space-y-2">
                {nodeTypes.map(nodeType => (
                  <button
                    key={nodeType.type}
                    onClick={() =>
                      addNode(nodeType.type as WorkflowBuilderNode['type'])
                    }
                    className="flex w-full items-center rounded-md border border-gray-200 px-3 py-2 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className={`rounded-md p-2 ${nodeType.color} mr-3`}>
                      <nodeType.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{nodeType.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedNode && (
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Node Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Node Name
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
                        updateNode(selectedNode.id, {
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeNode(selectedNode.id)}
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Node
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas */}
        <div className="relative flex-1 overflow-hidden bg-gray-50">
          <div className="absolute inset-0 p-6">
            <div className="relative h-full rounded-lg border-2 border-dashed border-gray-300">
              {nodes.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Zap className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                      No Nodes in Workflow
                    </h3>
                    <p className="mb-4 text-gray-500">
                      Add nodes from the sidebar to begin building your workflow
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative h-full">
                  {nodes.map((node, index) => {
                    const nodeType = nodeTypes.find(nt => nt.type === node.type)
                    return (
                      <div
                        key={node.id}
                        className={`absolute cursor-pointer rounded-lg border-2 bg-white p-4 transition-all ${
                          selectedNode?.id === node.id
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          left: node.position.x,
                          top: node.position.y,
                          width: '200px',
                        }}
                        onClick={() => setSelectedNode(node)}
                      >
                        <div className="mb-2 flex items-center">
                          <div
                            className={`rounded-md p-2 ${nodeType?.color} mr-3`}
                          >
                            {nodeType?.icon && (
                              <nodeType.icon className="h-4 w-4" />
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {node.name}
                          </span>
                        </div>
                        {node.description && (
                          <p className="mb-2 text-xs text-gray-500">
                            {node.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs capitalize text-gray-400">
                            {node.type}
                          </span>
                          {index < nodes.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
