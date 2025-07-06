import React from 'react'
import { cn } from '@/lib/utils'

interface QuickActionProps {
  title: string
  description: string
  icon?: string
  onClick?: () => void
  className?: string
}

function QuickAction({ title, description, icon, onClick, className }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors",
        className
      )}
    >
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">{icon}</span>
          </div>
        )}
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  )
}

export function QuickActions() {
  const actions = [
    {
      title: "Create Workflow",
      description: "Build a new automation workflow",
      icon: "+"
    },
    {
      title: "View Executions",
      description: "Monitor running and completed tasks",
      icon: "▶"
    },
    {
      title: "Add Integration",
      description: "Connect to external services",
      icon: "🔗"
    },
    {
      title: "View Analytics",
      description: "Check performance metrics",
      icon: "📊"
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {actions.map((action, index) => (
          <QuickAction key={index} {...action} />
        ))}
      </div>
    </div>
  )
}
