'use client'

import { memo, useState, useRef, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Settings, X, Edit3, Check, X as XIcon } from 'lucide-react'
import { WorkflowNodeData } from '../types'
import { getNodeTemplate } from '../node-templates'

interface BaseNodeProps extends NodeProps {
  data: WorkflowNodeData
  onConfigure?: (nodeId: string) => void
  onDelete?: (nodeId: string) => void
  onUpdate?: (nodeId: string, data: Partial<WorkflowNodeData>) => void
}

export const BaseNode = memo(({ id, data, onConfigure, onDelete, onUpdate }: BaseNodeProps) => {
  const template = getNodeTemplate(data.type)
  const IconComponent = template.icon
  const [isHovered, setIsHovered] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editName, setEditName] = useState(data.name)
  const [editDescription, setEditDescription] = useState(data.description)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [isEditingName])

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus()
      descriptionInputRef.current.select()
    }
  }, [isEditingDescription])

  const handleNameSave = () => {
    if (editName.trim() && editName !== data.name) {
      onUpdate?.(id, { name: editName.trim() })
    }
    setIsEditingName(false)
  }

  const handleDescriptionSave = () => {
    if (editDescription !== data.description) {
      onUpdate?.(id, { description: editDescription })
    }
    setIsEditingDescription(false)
  }

  const handleNameCancel = () => {
    setEditName(data.name)
    setIsEditingName(false)
  }

  const handleDescriptionCancel = () => {
    setEditDescription(data.description)
    setIsEditingDescription(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave()
    } else if (e.key === 'Escape') {
      handleNameCancel()
    }
  }

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleDescriptionSave()
    } else if (e.key === 'Escape') {
      handleDescriptionCancel()
    }
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 border-2 border-white shadow-sm"
      />

      <div className={`
        workflow-node ${data.type}-node
        min-w-[240px] max-w-[300px] px-4 py-4 rounded-xl border-2 shadow-lg
        bg-white transition-all duration-200 hover:shadow-xl
        ${isHovered ? 'border-blue-400 shadow-blue-100' : 'border-gray-200'}
        ${data.isConfigured ? 'ring-2 ring-green-200' : 'ring-2 ring-orange-200'}
      `}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`rounded-lg p-2 ${template.bgColor} shadow-sm`}>
              <IconComponent className={`h-5 w-5 ${template.color}`} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                {template.name}
              </span>
              <div className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1
                ${data.isConfigured
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-orange-100 text-orange-700 border border-orange-200'
                }
              `}>
                {data.isConfigured ? '✓ Configured' : '⚠ Setup needed'}
              </div>
            </div>
          </div>

          {/* Action buttons - show on hover */}
          {isHovered && (
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-blue-100 rounded-lg"
                onClick={() => onConfigure?.(id)}
                title="Configure node"
              >
                <Settings className="h-3.5 w-3.5 text-blue-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-red-100 rounded-lg"
                onClick={() => onDelete?.(id)}
                title="Delete node"
              >
                <X className="h-3.5 w-3.5 text-red-600" />
              </Button>
            </div>
          )}
        </div>

        {/* Editable Node name */}
        <div className="mb-3">
          {isEditingName ? (
            <div className="flex items-center space-x-1">
              <Input
                ref={nameInputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                className="text-sm font-semibold h-8 px-2"
                placeholder="Node name"
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-green-100"
                onClick={handleNameSave}
              >
                <Check className="h-3 w-3 text-green-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-red-100"
                onClick={handleNameCancel}
              >
                <XIcon className="h-3 w-3 text-red-600" />
              </Button>
            </div>
          ) : (
            <div
              className="group/name flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2"
              onClick={() => setIsEditingName(true)}
            >
              <h3 className="font-semibold text-gray-900 text-base flex-1">
                {data.name}
              </h3>
              <Edit3 className="h-3 w-3 text-gray-400 opacity-0 group-hover/name:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Editable Description */}
        <div className="mb-3">
          {isEditingDescription ? (
            <div className="space-y-2">
              <Textarea
                ref={descriptionInputRef}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleDescriptionKeyDown}
                className="text-sm resize-none h-16 px-2 py-1"
                placeholder="Node description (Ctrl+Enter to save)"
              />
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs hover:bg-green-100"
                  onClick={handleDescriptionSave}
                >
                  <Check className="h-3 w-3 text-green-600 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs hover:bg-red-100"
                  onClick={handleDescriptionCancel}
                >
                  <XIcon className="h-3 w-3 text-red-600 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="group/desc cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2"
              onClick={() => setIsEditingDescription(true)}
            >
              {data.description ? (
                <div className="flex items-start space-x-2">
                  <p className="text-sm text-gray-600 flex-1 leading-relaxed">
                    {data.description}
                  </p>
                  <Edit3 className="h-3 w-3 text-gray-400 opacity-0 group-hover/desc:opacity-100 transition-opacity mt-0.5" />
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-400">
                  <p className="text-sm italic flex-1">
                    Click to add description...
                  </p>
                  <Edit3 className="h-3 w-3 opacity-0 group-hover/desc:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Configuration preview */}
        {data.isConfigured && Object.keys(data.config).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Configuration:</div>
            <div className="space-y-1">
              {Object.entries(data.config).slice(0, 2).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-gray-600 capitalize">{key}:</span>
                  <span className="text-gray-800 font-medium truncate ml-2 max-w-[100px]">
                    {String(value)}
                  </span>
                </div>
              ))}
              {Object.keys(data.config).length > 2 && (
                <div className="text-xs text-gray-400 italic">
                  +{Object.keys(data.config).length - 2} more...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 border-2 border-white shadow-sm"
      />
    </div>
  )
})
