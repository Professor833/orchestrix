import React, { memo } from 'react'
import { NodeTypes, NodeProps } from 'reactflow'
import { BaseNode } from './BaseNode'
import { WorkflowNodeData } from '../types'

// Create wrapper components that pass handlers to BaseNode
const TriggerNode = memo((props: NodeProps<WorkflowNodeData>) => {
  return (
    <BaseNode
      {...props}
      onConfigure={props.data?.onConfigure}
      onDelete={props.data?.onDelete}
      onUpdate={props.data?.onUpdate}
    />
  )
})
TriggerNode.displayName = 'TriggerNode'

const ActionNode = memo((props: NodeProps<WorkflowNodeData>) => {
  return (
    <BaseNode
      {...props}
      onConfigure={props.data?.onConfigure}
      onDelete={props.data?.onDelete}
      onUpdate={props.data?.onUpdate}
    />
  )
})
ActionNode.displayName = 'ActionNode'

const ConditionNode = memo((props: NodeProps<WorkflowNodeData>) => {
  return (
    <BaseNode
      {...props}
      onConfigure={props.data?.onConfigure}
      onDelete={props.data?.onDelete}
      onUpdate={props.data?.onUpdate}
    />
  )
})
ConditionNode.displayName = 'ConditionNode'

const OutputNode = memo((props: NodeProps<WorkflowNodeData>) => {
  return (
    <BaseNode
      {...props}
      onConfigure={props.data?.onConfigure}
      onDelete={props.data?.onDelete}
      onUpdate={props.data?.onUpdate}
    />
  )
})
OutputNode.displayName = 'OutputNode'

// Create stable nodeTypes object
export const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  output: OutputNode,
}

export { BaseNode }
