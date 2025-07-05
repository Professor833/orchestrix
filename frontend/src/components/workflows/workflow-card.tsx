'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Workflow } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import {
  BrainCircuit,
  Calendar,
  Clock,
  Copy,
  Edit,
  Pause,
  Play,
  Settings,
  Trash2,
  Workflow as WorkflowIcon,
} from 'lucide-react'
import { Route } from 'next'
import Link from 'next/link'

interface WorkflowCardProps {
  workflow: Workflow
  onExecute: (workflowId: string) => void
  onToggleStatus: (workflow: Workflow) => void
  onClone: (workflowId: string) => void
  onDelete?: (workflowId: string) => void
}

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'trigger':
      return <WorkflowIcon className="h-4 w-4 text-blue-500" />
    case 'action':
      return <BrainCircuit className="h-4 w-4 text-green-500" />
    case 'condition':
      return <Settings className="h-4 w-4 text-purple-500" />
    default:
      return <WorkflowIcon className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'archived':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTriggerIcon = (triggerType: string) => {
  switch (triggerType) {
    case 'manual':
      return <Play className="h-3 w-3" />
    case 'scheduled':
      return <Clock className="h-3 w-3" />
    case 'webhook':
      return <Settings className="h-3 w-3" />
    default:
      return <WorkflowIcon className="h-3 w-3" />
  }
}

export function WorkflowCard({
  workflow,
  onExecute,
  onToggleStatus,
  onClone,
  onDelete,
}: WorkflowCardProps) {
  return (
    <Card className="group flex h-full flex-col border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-lg">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-200">
            <WorkflowIcon className="h-5 w-5 text-blue-600" />
          </div>

          <div className="min-w-0 flex-1">
            <Link href={`/workflows/${workflow.id}` as Route}>
              <CardTitle className="mb-2 line-clamp-2 cursor-pointer text-lg font-semibold leading-tight text-gray-900 hover:text-blue-600">
                {workflow.name}
              </CardTitle>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={getStatusColor(workflow.status)}
                variant="outline"
              >
                {workflow.status}
              </Badge>
              {workflow.is_active && (
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700"
                >
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons - always visible on mobile, hover on desktop */}
        <div className="mt-3 flex items-center justify-end gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExecute(workflow.id)}
            title="Execute workflow"
            className="h-8 w-8 p-0"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(workflow)}
            title={workflow.is_active ? 'Pause workflow' : 'Activate workflow'}
            className="h-8 w-8 p-0"
          >
            {workflow.is_active ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClone(workflow.id)}
            title="Clone workflow"
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Link href={`/workflows/${workflow.id}/edit` as Route}>
            <Button
              variant="ghost"
              size="sm"
              title="Edit workflow"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(workflow.id)}
              title="Delete workflow"
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pt-0">
        <CardDescription className="mb-4 line-clamp-3 flex-shrink-0 text-sm text-gray-600">
          {workflow.description || 'No description provided'}
        </CardDescription>

        <div className="mb-4 grid flex-shrink-0 grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {getTriggerIcon(workflow.trigger_type)}
            <span className="truncate capitalize">{workflow.trigger_type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate">{workflow.node_count} nodes</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />v{workflow.version}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(workflow.updated_at))} ago
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {workflow.category && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-xs text-blue-700"
                >
                  {workflow.category}
                </Badge>
              )}
            </div>

            {workflow.last_run_at && (
              <Badge variant="outline" className="text-xs">
                Last run {formatDistanceToNow(new Date(workflow.last_run_at))}{' '}
                ago
              </Badge>
            )}
          </div>

          {workflow.tags && workflow.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {workflow.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {workflow.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{workflow.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
