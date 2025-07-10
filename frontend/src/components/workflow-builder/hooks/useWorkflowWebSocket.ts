'use client'

import { useEffect, useRef, useCallback } from 'react'
import { WorkflowData, WorkflowNode, WorkflowEdge } from '../types'

interface WebSocketMessage {
  type: 'node_added' | 'node_updated' | 'node_deleted' | 'edge_added' | 'edge_deleted' | 'workflow_updated'
  data: any
  userId: string
  timestamp: string
}

interface UseWorkflowWebSocketProps {
  workflowId: string
  onNodeAdded?: (node: WorkflowNode) => void
  onNodeUpdated?: (node: WorkflowNode) => void
  onNodeDeleted?: (nodeId: string) => void
  onEdgeAdded?: (edge: WorkflowEdge) => void
  onEdgeDeleted?: (edgeId: string) => void
  onWorkflowUpdated?: (workflow: WorkflowData) => void
}

export function useWorkflowWebSocket({
  workflowId,
  onNodeAdded,
  onNodeUpdated,
  onNodeDeleted,
  onEdgeAdded,
  onEdgeDeleted,
  onWorkflowUpdated,
}: UseWorkflowWebSocketProps) {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      // Replace with your actual WebSocket URL
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/workflows/${workflowId}/`
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        console.log('WebSocket connected for workflow:', workflowId)
        reconnectAttempts.current = 0
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          switch (message.type) {
            case 'node_added':
              onNodeAdded?.(message.data)
              break
            case 'node_updated':
              onNodeUpdated?.(message.data)
              break
            case 'node_deleted':
              onNodeDeleted?.(message.data.nodeId)
              break
            case 'edge_added':
              onEdgeAdded?.(message.data)
              break
            case 'edge_deleted':
              onEdgeDeleted?.(message.data.edgeId)
              break
            case 'workflow_updated':
              onWorkflowUpdated?.(message.data)
              break
            default:
              console.log('Unknown message type:', message.type)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
    }
  }, [workflowId, onNodeAdded, onNodeUpdated, onNodeDeleted, onEdgeAdded, onEdgeDeleted, onWorkflowUpdated])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (ws.current) {
      ws.current.close(1000, 'Component unmounting')
      ws.current = null
    }
  }, [])

  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'userId' | 'timestamp'>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        userId: 'current-user-id', // Replace with actual user ID
        timestamp: new Date().toISOString(),
      }
      ws.current.send(JSON.stringify(fullMessage))
    }
  }, [])

  // Specific message senders
  const broadcastNodeAdded = useCallback((node: WorkflowNode) => {
    sendMessage({ type: 'node_added', data: node })
  }, [sendMessage])

  const broadcastNodeUpdated = useCallback((node: WorkflowNode) => {
    sendMessage({ type: 'node_updated', data: node })
  }, [sendMessage])

  const broadcastNodeDeleted = useCallback((nodeId: string) => {
    sendMessage({ type: 'node_deleted', data: { nodeId } })
  }, [sendMessage])

  const broadcastEdgeAdded = useCallback((edge: WorkflowEdge) => {
    sendMessage({ type: 'edge_added', data: edge })
  }, [sendMessage])

  const broadcastEdgeDeleted = useCallback((edgeId: string) => {
    sendMessage({ type: 'edge_deleted', data: { edgeId } })
  }, [sendMessage])

  const broadcastWorkflowUpdated = useCallback((workflow: WorkflowData) => {
    sendMessage({ type: 'workflow_updated', data: workflow })
  }, [sendMessage])

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return {
    isConnected: ws.current?.readyState === WebSocket.OPEN,
    connect,
    disconnect,
    broadcastNodeAdded,
    broadcastNodeUpdated,
    broadcastNodeDeleted,
    broadcastEdgeAdded,
    broadcastEdgeDeleted,
    broadcastWorkflowUpdated,
  }
}
