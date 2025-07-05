'use client'

import { Button } from '@/components/ui/button'
import { workflowService } from '@/lib/services/workflows'
import {
  ArrowRight,
  Code,
  Database,
  Play,
  Save,
  Settings,
  Trash2,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface WorkflowNode {
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

export function WorkflowBuilder() {
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const addNode = (type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodes.length + 1}`,
      description: '',
      config: {},
      position: { x: 100 + nodes.length * 200, y: 100 },
    }
    setNodes([...nodes, newNode])
  }

  const removeNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
  }

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
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

    setIsLoading(true)
    try {
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        definition: {
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
        is_active: false,
      }

      await workflowService.createWorkflow(workflowData)
      toast.success('Workflow created successfully!')
      router.push('/workflows')
    } catch (error) {
      toast.error('Failed to create workflow')
      console.error('Error creating workflow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTest = async () => {
    if (!workflowName.trim() || nodes.length === 0) {
      toast.error('Please add a workflow name and at least one node')
      return
    }

    toast.success('Test execution started (simulated)')
  }

  return (
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
                  onClick={() => addNode(nodeType.type as WorkflowNode['type'])}
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
                    Start Building Your Workflow
                  </h3>
                  <p className="mb-4 text-gray-500">
                    Add nodes from the sidebar to begin creating your workflow
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
                        <span className="text-sm font-medium">{node.name}</span>
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

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {nodes.length} node{nodes.length !== 1 ? 's' : ''} added
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleTest} disabled={isLoading}>
              <Play className="mr-2 h-4 w-4" />
              Test Workflow
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Workflow'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
