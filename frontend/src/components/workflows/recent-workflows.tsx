import React from 'react'
import { cn } from '@/lib/utils'

interface WorkflowItemProps {
  name: string
  description: string
  status: 'active' | 'inactive' | 'running'
  lastRun?: string
  className?: string
}

function WorkflowItem({ name, description, status, lastRun, className }: WorkflowItemProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    running: 'bg-blue-100 text-blue-800'
  }

  return (
    <div className={cn("flex items-center justify-between p-4 border rounded-lg", className)}>
      <div className="flex flex-col">
        <h3 className="font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        {lastRun && (
          <p className="text-xs text-gray-400 mt-1">Last run: {lastRun}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          statusColors[status]
        )}>
          {status}
        </span>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          View
        </button>
      </div>
    </div>
  )
}

export function RecentWorkflows() {
  const workflows = [
    {
      name: "Data Processing Pipeline",
      description: "Process incoming data from multiple sources",
      status: 'running' as const,
      lastRun: "2 minutes ago"
    },
    {
      name: "Email Notification System",
      description: "Send automated emails to customers",
      status: 'active' as const,
      lastRun: "1 hour ago"
    },
    {
      name: "Report Generation",
      description: "Generate daily reports and analytics",
      status: 'active' as const,
      lastRun: "3 hours ago"
    },
    {
      name: "Backup System",
      description: "Automated backup of critical data",
      status: 'inactive' as const,
      lastRun: "1 day ago"
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recent Workflows</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          View all
        </button>
      </div>
      <div className="space-y-3">
        {workflows.map((workflow, index) => (
          <WorkflowItem key={index} {...workflow} />
        ))}
      </div>
    </div>
  )
}