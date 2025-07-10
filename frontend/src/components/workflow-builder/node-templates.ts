import {
  Zap,
  Settings,
  GitBranch,
  Database,
  Play,
  Mail,
  MessageSquare,
  Globe,
  Code,
  FileText
} from 'lucide-react'
import { NodeTemplate, NodeType } from './types'

export const NODE_TEMPLATES: Record<NodeType, NodeTemplate> = {
  trigger: {
    type: 'trigger',
    name: 'Trigger',
    description: 'Start your workflow with an event',
    icon: Zap,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    defaultConfig: {
      triggerType: 'manual',
      schedule: null,
      webhook: null
    }
  },
  action: {
    type: 'action',
    name: 'Action',
    description: 'Perform an operation or task',
    icon: Settings,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    defaultConfig: {
      actionType: 'api_call',
      endpoint: '',
      method: 'GET',
      headers: {},
      body: {}
    }
  },
  condition: {
    type: 'condition',
    name: 'Condition',
    description: 'Add logic and branching to your workflow',
    icon: GitBranch,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    defaultConfig: {
      conditionType: 'if',
      expression: '',
      operator: 'equals',
      value: ''
    }
  },
  output: {
    type: 'output',
    name: 'Output',
    description: 'Send data or notifications',
    icon: Database,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    defaultConfig: {
      outputType: 'webhook',
      destination: '',
      format: 'json'
    }
  }
}

export const getNodeTemplate = (type: NodeType): NodeTemplate => {
  return NODE_TEMPLATES[type]
}

export const getAllNodeTemplates = (): NodeTemplate[] => {
  return Object.values(NODE_TEMPLATES)
}
