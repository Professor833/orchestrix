import React from 'react'
import { NodeTypes, NodeProps } from 'reactflow'
import { BaseNode } from './BaseNode'
import { WorkflowNodeData } from '../types'

// Create wrapper components that pass handlers to BaseNode
const TriggerNode = (props: NodeProps<WorkflowNodeData>) => {
  return (
    <BaseNode
      {...props}
      onConfigure={props.data?.onConfigure}
      onDelete={props.data?.onDelete}
      onUpdate={props.data?.onUpdate}
    />
  )
}

const ActionNode = (props: NodeProps<WorkflowNodeData>) => {
  return (
    <BaseNode
      {...props}
      onConfigure={props.data?.onConfigure}
      onDelete={props.data?.onDelete}
      onUpdate={props.data?.onUpdate}
    />
  )
}

const ConditionNode = (props: NodeProps<WorkflowNodeData>) => {
  return (
    <BaseNode
      {...props}
      onConfigure={props.data?.onConfigure}
      onDelete={props.data?.onDelete}
      onUpdate={props.data?.onUpdate}
    />
  )
}

const OutputNode = (props: NodeProps<WorkflowNodeData>) => {
  return (
    <BaseNode
      {...props}
      onConfigure={props.data?.onConfigure}
      onDelete={props.data?.onDelete}
      onUpdate={props.data?.onUpdate}
    />
  )
}

export const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  output: OutputNode,
}

export { BaseNode }
