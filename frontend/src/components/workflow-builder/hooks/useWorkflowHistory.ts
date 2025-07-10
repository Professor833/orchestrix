'use client'

import { useState, useCallback } from 'react'
import { WorkflowData } from '../types'

interface HistoryState {
  past: WorkflowData[]
  present: WorkflowData
  future: WorkflowData[]
}

export function useWorkflowHistory(initialState: WorkflowData) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialState,
    future: [],
  })

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  const undo = useCallback(() => {
    if (!canUndo) return

    setHistory((prev) => {
      const previous = prev.past[prev.past.length - 1]
      const newPast = prev.past.slice(0, prev.past.length - 1)

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      }
    })
  }, [canUndo])

  const redo = useCallback(() => {
    if (!canRedo) return

    setHistory((prev) => {
      const next = prev.future[0]
      const newFuture = prev.future.slice(1)

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      }
    })
  }, [canRedo])

  const setState = useCallback((newState: WorkflowData) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: newState,
      future: [],
    }))
  }, [])

  const resetHistory = useCallback((newState: WorkflowData) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    })
  }, [])

  return {
    state: history.present,
    setState,
    resetHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
