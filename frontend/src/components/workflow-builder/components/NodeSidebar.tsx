'use client'

import { getAllNodeTemplates } from '../node-templates'
import { DragItem, NodeType } from '../types'
import { cn } from '@/lib/utils'

interface NodeSidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void
}

export function NodeSidebar({ onDragStart }: NodeSidebarProps) {
  const nodeTemplates = getAllNodeTemplates()

  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Node Library</h3>
        <p className="text-sm text-gray-600">
          Drag nodes to the canvas to build your workflow
        </p>
      </div>

      <div className="space-y-3">
        {nodeTemplates.map((template) => {
          const IconComponent = template.icon

          return (
            <div
              key={template.type}
              draggable
              onDragStart={(event) => onDragStart(event, template.type)}
              className={cn(
                'flex cursor-grab items-center space-x-3 rounded-lg border-2 p-3 transition-all hover:shadow-md active:cursor-grabbing',
                template.bgColor,
                template.borderColor,
                'hover:border-gray-300'
              )}
            >
              <div className={cn('rounded-md p-2', template.bgColor)}>
                <IconComponent className={cn('h-5 w-5', template.color)} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-xs text-gray-600">{template.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-3">
        <h4 className="font-medium text-blue-900">Quick Tips</h4>
        <ul className="mt-2 space-y-1 text-xs text-blue-700">
          <li>• Drag nodes from here to the canvas</li>
          <li>• Connect nodes by dragging from handles</li>
          <li>• Click the settings icon to configure nodes</li>
          <li>• Use Ctrl+Z to undo changes</li>
        </ul>
      </div>
    </div>
  )
}
