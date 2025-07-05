'use client'

import {
  Activity,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react'

const metrics = [
  {
    name: 'Total Executions',
    value: '2,847',
    change: '+12.5%',
    changeType: 'positive',
    icon: Activity,
  },
  {
    name: 'Success Rate',
    value: '94.2%',
    change: '+2.1%',
    changeType: 'positive',
    icon: CheckCircle,
  },
  {
    name: 'Avg. Duration',
    value: '3.2s',
    change: '-0.8s',
    changeType: 'positive',
    icon: Clock,
  },
  {
    name: 'Failed Executions',
    value: '164',
    change: '-8.3%',
    changeType: 'positive',
    icon: XCircle,
  },
]

export function AnalyticsMetrics() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(metric => (
        <div
          key={metric.name}
          className="rounded-lg border border-gray-200 bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.name}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metric.value}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <metric.icon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {metric.changeType === 'positive' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`ml-2 text-sm font-medium ${
                metric.changeType === 'positive'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {metric.change}
            </span>
            <span className="ml-2 text-sm text-gray-500">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  )
}
