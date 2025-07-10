import dagre from 'dagre'
import { Position } from 'reactflow'
import { WorkflowNode, WorkflowEdge } from '../types'

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 200
const nodeHeight = 120

export const getLayoutedElements = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  direction = 'TB'
) => {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const newNode: WorkflowNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }

    return newNode
  })

  return { nodes: layoutedNodes, edges }
}

export const calculateNodePosition = (
  existingNodes: WorkflowNode[],
  nodeType: string
): { x: number; y: number } => {
  if (existingNodes.length === 0) {
    return { x: 250, y: 100 }
  }

  // Find the rightmost node and place new node to the right
  const rightmostNode = existingNodes.reduce((prev, current) => {
    return prev.position.x > current.position.x ? prev : current
  })

  return {
    x: rightmostNode.position.x + nodeWidth + 50,
    y: rightmostNode.position.y,
  }
}
