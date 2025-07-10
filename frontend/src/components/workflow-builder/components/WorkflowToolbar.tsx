'use client'

import { Button } from '@/components/ui/button'
import {
  Save,
  Play,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layout,
  Download,
  Upload
} from 'lucide-react'

interface WorkflowToolbarProps {
  onSave: () => void
  onTest: () => void
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onAutoLayout: () => void
  onExport?: () => void
  onImport?: () => void
  canUndo: boolean
  canRedo: boolean
  isSaving: boolean
  isTesting: boolean
}

export function WorkflowToolbar({
  onSave,
  onTest,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutoLayout,
  onExport,
  onImport,
  canUndo,
  canRedo,
  isSaving,
  isTesting
}: WorkflowToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      {/* Left Section - Main Actions */}
      <div className="flex items-center space-x-2">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>

        <Button
          onClick={onTest}
          disabled={isTesting}
          variant="outline"
        >
          <Play className="mr-2 h-4 w-4" />
          {isTesting ? 'Testing...' : 'Test'}
        </Button>

        <div className="h-6 w-px bg-gray-300" />

        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="ghost"
          size="sm"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          onClick={onRedo}
          disabled={!canRedo}
          variant="ghost"
          size="sm"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Center Section - View Controls */}
      <div className="flex items-center space-x-2">
        <Button
          onClick={onZoomOut}
          variant="ghost"
          size="sm"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button
          onClick={onZoomIn}
          variant="ghost"
          size="sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button
          onClick={onFitView}
          variant="ghost"
          size="sm"
        >
          <Maximize className="h-4 w-4" />
        </Button>

        <Button
          onClick={onAutoLayout}
          variant="ghost"
          size="sm"
        >
          <Layout className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section - Import/Export */}
      <div className="flex items-center space-x-2">
        {onImport && (
          <Button
            onClick={onImport}
            variant="ghost"
            size="sm"
          >
            <Upload className="h-4 w-4" />
          </Button>
        )}

        {onExport && (
          <Button
            onClick={onExport}
            variant="ghost"
            size="sm"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
