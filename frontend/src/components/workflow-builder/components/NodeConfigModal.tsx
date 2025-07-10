'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WorkflowNodeData, NodeType } from '../types'
import { getNodeTemplate } from '../node-templates'

interface NodeConfigModalProps {
  isOpen: boolean
  onClose: () => void
  nodeData: WorkflowNodeData | null
  onSave: (updatedData: WorkflowNodeData) => void
  onDelete?: (nodeId: string) => void
}

export function NodeConfigModal({
  isOpen,
  onClose,
  nodeData,
  onSave,
  onDelete,
}: NodeConfigModalProps) {
  const [formData, setFormData] = useState<WorkflowNodeData | null>(null)

  useEffect(() => {
    if (nodeData) {
      setFormData({ ...nodeData })
    }
  }, [nodeData])

  if (!formData) return null

  const template = getNodeTemplate(formData.type)
  const IconComponent = template.icon

  const handleSave = () => {
    if (formData) {
      onSave({
        ...formData,
        isConfigured: true,
      })
      onClose()
    }
  }

  const updateConfig = (key: string, value: any) => {
    setFormData(prev => prev ? {
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    } : null)
  }

  const handleDelete = () => {
    if (formData && onDelete) {
      onDelete(formData.id)
      onClose()
    }
  }

  const renderConfigFields = () => {
    switch (formData.type) {
      case 'trigger':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="triggerType">Trigger Type</Label>
              <Select
                value={formData.config.triggerType || 'manual'}
                onValueChange={(value) => updateConfig('triggerType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.config.triggerType === 'scheduled' && (
              <div>
                <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
                <Input
                  id="schedule"
                  value={formData.config.schedule || ''}
                  onChange={(e) => updateConfig('schedule', e.target.value)}
                  placeholder="0 0 * * *"
                />
              </div>
            )}

            {formData.config.triggerType === 'webhook' && (
              <div>
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input
                  id="webhook"
                  value={formData.config.webhook || ''}
                  onChange={(e) => updateConfig('webhook', e.target.value)}
                  placeholder="https://api.example.com/webhook"
                />
              </div>
            )}
          </div>
        )

      case 'action':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="actionType">Action Type</Label>
              <Select
                value={formData.config.actionType || 'api_call'}
                onValueChange={(value) => updateConfig('actionType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_call">API Call</SelectItem>
                  <SelectItem value="email">Send Email</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="database">Database Query</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                value={formData.config.endpoint || ''}
                onChange={(e) => updateConfig('endpoint', e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>

            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select
                value={formData.config.method || 'GET'}
                onValueChange={(value) => updateConfig('method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="expression">Condition Expression</Label>
              <Input
                id="expression"
                value={formData.config.expression || ''}
                onChange={(e) => updateConfig('expression', e.target.value)}
                placeholder="data.status == 'success'"
              />
            </div>

            <div>
              <Label htmlFor="operator">Operator</Label>
              <Select
                value={formData.config.operator || 'equals'}
                onValueChange={(value) => updateConfig('operator', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                value={formData.config.value || ''}
                onChange={(e) => updateConfig('value', e.target.value)}
                placeholder="Expected value"
              />
            </div>
          </div>
        )

      case 'output':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="outputType">Output Type</Label>
              <Select
                value={formData.config.outputType || 'webhook'}
                onValueChange={(value) => updateConfig('outputType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select output type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={formData.config.destination || ''}
                onChange={(e) => updateConfig('destination', e.target.value)}
                placeholder="Destination URL or path"
              />
            </div>

            <div>
              <Label htmlFor="format">Format</Label>
              <Select
                value={formData.config.format || 'json'}
                onValueChange={(value) => updateConfig('format', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className={`rounded-lg p-2 ${template.bgColor}`}>
              <IconComponent className={`h-5 w-5 ${template.color}`} />
            </div>
            <span>Configure {template.name}</span>
          </DialogTitle>
          <DialogDescription>
            Configure the settings for this {template.name.toLowerCase()} node.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Node Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => prev ? { ...prev, name: e.target.value } : null)}
              placeholder="Enter node name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => prev ? { ...prev, description: e.target.value } : null)}
              placeholder="Enter node description"
              rows={2}
            />
          </div>

          {renderConfigFields()}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete Node
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
