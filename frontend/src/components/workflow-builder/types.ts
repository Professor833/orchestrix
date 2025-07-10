import { Node, Edge, XYPosition } from 'reactflow'

export type NodeType = 'trigger' | 'action' | 'condition' | 'output'

export interface WorkflowNodeData {
  id: string
  type: NodeType
  name: string
  description: string
  config: Record<string, any>
  isConfigured: boolean
  // Optional handler functions
  onConfigure?: (nodeId: string) => void
  onDelete?: (nodeId: string) => void
  onUpdate?: (nodeId: string, data: Partial<WorkflowNodeData>) => void
}

export interface WorkflowNode extends Node<WorkflowNodeData> {
  type: NodeType
  data: WorkflowNodeData
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  type?: 'default' | 'smoothstep' | 'step' | 'straight'
}

export interface WorkflowData {
  id?: string
  name: string
  description: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  viewport?: {
    x: number
    y: number
    zoom: number
  }
}

export interface NodeTemplate {
  type: NodeType
  name: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  borderColor: string
  defaultConfig: Record<string, any>
}

export interface DragItem {
  type: 'node'
  nodeType: NodeType
  template: NodeTemplate
}

export interface WorkflowBuilderProps {
  workflowId?: string
  initialData?: WorkflowData
  onSave?: (data: WorkflowData) => void
  onTest?: (data: WorkflowData) => void
  readOnly?: boolean
}
