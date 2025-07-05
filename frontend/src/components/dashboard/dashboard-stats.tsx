import React from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  className?: string
}

function StatCard({ title, value, description, className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}

export function DashboardStats() {
  const stats = [
    {
      title: "Active Workflows",
      value: "12",
      description: "2 running now"
    },
    {
      title: "Total Executions",
      value: "1,234",
      description: "last 30 days"
    },
    {
      title: "Success Rate",
      value: "98.5%",
      description: "last 7 days"
    },
    {
      title: "Integrations",
      value: "8",
      description: "connected"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}