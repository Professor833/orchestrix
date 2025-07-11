'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
  Connection,
  Edge,
  BackgroundVariant,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { WorkflowToolbar } from './components/WorkflowToolbar'
import { NodeSidebar } from './components/NodeSidebar'
import { NodeConfigModal } from './components/NodeConfigModal'
import { nodeTypes } from './nodes'
import {
  WorkflowData,
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  NodeType,
  NodeTemplate,
  DragItem,
  WorkflowBuilderProps
} from './types'
import { getNodeTemplate } from './node-templates'
import { getLayoutedElements, calculateNodePosition } from './utils/layout'
import { useWorkflowData } from './hooks/useWorkflowData'
import { useWorkflowHistory } from './hooks/useWorkflowHistory'

let nodeId = 0
const getId = () => `node_${nodeId++}`

function WorkflowBuilderInner({
  workflowId,
  initialData,
  onSave,
  onTest,
  readOnly = false
}: WorkflowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [selectedNodeForConfig, setSelectedNodeForConfig] = useState<WorkflowNode | null>(null)
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  // Initialize workflow data
  const defaultData: WorkflowData = {
    name: 'New Workflow',
    description: '',
    nodes: [],
    edges: [],
  }

  const {
    workflowData,
    isLoading,
    saveWorkflowData,
    testWorkflowData,
    isSaving,
    isTesting
  } = useWorkflowData(workflowId)

  const currentData = workflowData || initialData || defaultData
  const { state, setState, undo, redo, canUndo, canRedo } = useWorkflowHistory(currentData)

  const [nodes, setNodes, onNodesChange] = useNodesState(state.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(state.edges)

  // Update nodes and edges when state changes - moved after handlers are declared

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop
  // Moved onDrop after handler declarations

  // Handle drag start from sidebar
  const onDragStart = useCallback((event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  // Handle edge connection
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const newEdge: WorkflowEdge = {
        ...params,
        id: `edge_${params.source}_${params.target}`,
        type: 'smoothstep',
      } as WorkflowEdge

      const newEdges = addEdge(newEdge, edges)
      const newState = {
        ...state,
        edges: newEdges as WorkflowEdge[]
      }
      setState(newState)
    },
    [edges, state, setState]
  )

  // Handle node configuration
  const onNodeConfigure = useCallback((nodeId: string) => {
    const nodeToConfig = nodes.find(node => node.id === nodeId)
    if (nodeToConfig) {
      setSelectedNodeForConfig(nodeToConfig as WorkflowNode)
      setConfigModalOpen(true)
    }
  }, [nodes])

  const onNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowNodeData>) => {
    setNodes(nds => nds.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            ...updates
          }
        }
      }
      return node
    }))
  }, [])

  // Handle node deletion
  const onNodeDelete = useCallback(
    (nodeId: string) => {
      const newNodes = nodes.filter((node) => node.id !== nodeId)
      const newEdges = edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      )
      const newState = {
        ...state,
        nodes: newNodes as WorkflowNode[],
        edges: newEdges as WorkflowEdge[]
      }
      setState(newState)

      // Also update React Flow nodes and edges directly
      setNodes(newNodes)
      setEdges(newEdges)
    },
    [nodes, edges, state, setState, setNodes, setEdges]
  )

  // Handle auto layout
  const onAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[]
    )
    const filteredNodes = layoutedNodes.filter(node => node.id !== null)
    const filteredEdges = layoutedEdges.filter(edge => edge.id !== null)
    const newState = {
      ...state,
      nodes: filteredNodes as WorkflowNode[],
      edges: filteredEdges as WorkflowEdge[]
    }
    setState(newState)
  }, [nodes, edges, state, setState])

  // Initialize nodes with handlers only once when component mounts
  useEffect(() => {
    if (state.nodes.length > 0 && nodes.length === 0) {
      const nodesWithHandlers = state.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onConfigure: onNodeConfigure,
          onDelete: onNodeDelete,
          onUpdate: onNodeUpdate,
        }
      }))
      setNodes(nodesWithHandlers)
    }
  }, [state.nodes.length, nodes.length, setNodes, onNodeConfigure, onNodeDelete, onNodeUpdate])

  // Handle drop (after handlers are declared)
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType

      if (!nodeType || !reactFlowBounds || !reactFlowInstance) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const template = getNodeTemplate(nodeType)
      const newNode: WorkflowNode = {
        id: getId(),
        type: nodeType,
        position,
        data: {
          id: getId(),
          type: nodeType,
          name: `${template.name} ${state.nodes.length + 1}`,
          description: template.description,
          config: { ...template.defaultConfig },
          isConfigured: false,
          onConfigure: onNodeConfigure,
          onDelete: onNodeDelete,
          onUpdate: onNodeUpdate,
        },
      }

      const newNodes = [...state.nodes, newNode]
      const newState = { ...state, nodes: newNodes as WorkflowNode[] }
      setState(newState)

      // Also update React Flow nodes directly
      setNodes(prevNodes => [...prevNodes, newNode])
    },
    [reactFlowInstance, state, setState, setNodes, onNodeConfigure, onNodeDelete, onNodeUpdate]
  )

  // Handle keyboard events for node deletion
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter(node => node.selected)
        if (selectedNodes.length > 0) {
          selectedNodes.forEach(node => onNodeDelete(node.id))
        }
      }
    },
    [nodes, onNodeDelete]
  )

  // Simple sync of edges only - nodes are managed separately
  useEffect(() => {
    setEdges(state.edges)
  }, [state.edges, setEdges])

  // Handle save
  const handleSave = useCallback(() => {
    const dataToSave = {
      ...state,
      nodes: nodes as WorkflowNode[],
      edges: edges as WorkflowEdge[],
      viewport: reactFlowInstance?.getViewport()
    }

    if (onSave) {
      onSave(dataToSave)
    } else {
      saveWorkflowData(dataToSave)
    }
  }, [state, nodes, edges, onSave, saveWorkflowData])

  // Handle test
  const handleTest = useCallback(() => {
    const dataToTest = {
      ...state,
      nodes: nodes as WorkflowNode[],
      edges: edges as WorkflowEdge[],
      viewport: reactFlowInstance?.getViewport()
    }

    if (onTest) {
      onTest(dataToTest)
    } else {
      testWorkflowData(dataToTest)
    }
  }, [state, nodes, edges, onTest, testWorkflowData])

  // Handle node configuration save
  const handleNodeConfigSave = useCallback((updatedNodeData: WorkflowNodeData) => {
    const newNodes = nodes.map(node =>
      node.id === updatedNodeData.id
        ? { ...node, data: updatedNodeData }
        : node
    )
    const newState = {
      ...state,
      nodes: newNodes as WorkflowNode[]
    }
    setState(newState)
    setConfigModalOpen(false)
    setSelectedNodeForConfig(null)
  }, [nodes, state, setState])

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading workflow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[800px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <WorkflowToolbar
        onSave={handleSave}
        onTest={handleTest}
        onUndo={undo}
        onRedo={redo}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitView={() => fitView()}
        onAutoLayout={onAutoLayout}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaving={isSaving}
        isTesting={isTesting}
      />

      <div className="flex flex-1 overflow-hidden">
        {!readOnly && <NodeSidebar onDragStart={onDragStart} />}

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onKeyDown={onKeyDown}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#e5e7eb"
            />

            <Panel position="top-right" className="bg-white p-2 rounded shadow">
              <div className="text-sm text-gray-600">
                Nodes: {nodes.length} | Edges: {edges.length}
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      <NodeConfigModal
        isOpen={configModalOpen}
        onClose={() => {
          setConfigModalOpen(false)
          setSelectedNodeForConfig(null)
        }}
        nodeData={selectedNodeForConfig?.data || null}
        onSave={handleNodeConfigSave}
        onDelete={onNodeDelete}
      />
    </div>
  )
}

export function WorkflowBuilder(props: WorkflowBuilderProps) {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner {...props} />
    </ReactFlowProvider>
  )
}
