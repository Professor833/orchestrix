'use client'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Mock data for demonstration
const executionTrendData = [
  { date: '2024-01-01', executions: 45, successful: 42, failed: 3 },
  { date: '2024-01-02', executions: 52, successful: 48, failed: 4 },
  { date: '2024-01-03', executions: 38, successful: 35, failed: 3 },
  { date: '2024-01-04', executions: 67, successful: 61, failed: 6 },
  { date: '2024-01-05', executions: 71, successful: 68, failed: 3 },
  { date: '2024-01-06', executions: 59, successful: 54, failed: 5 },
  { date: '2024-01-07', executions: 83, successful: 79, failed: 4 },
]

const workflowPerformanceData = [
  {
    name: 'Email Campaign',
    executions: 234,
    avgDuration: 12.5,
    successRate: 94,
  },
  { name: 'Data Sync', executions: 189, avgDuration: 45.2, successRate: 98 },
  {
    name: 'Report Generator',
    executions: 156,
    avgDuration: 78.1,
    successRate: 89,
  },
  { name: 'Slack Alerts', executions: 298, avgDuration: 3.2, successRate: 96 },
  {
    name: 'Backup Process',
    executions: 67,
    avgDuration: 120.5,
    successRate: 92,
  },
]

const statusDistributionData = [
  { name: 'Completed', value: 847, color: '#10B981' },
  { name: 'Failed', value: 89, color: '#EF4444' },
  { name: 'Running', value: 23, color: '#3B82F6' },
  { name: 'Cancelled', value: 12, color: '#F59E0B' },
]

const hourlyExecutionData = [
  { hour: '00:00', executions: 12 },
  { hour: '02:00', executions: 8 },
  { hour: '04:00', executions: 5 },
  { hour: '06:00', executions: 15 },
  { hour: '08:00', executions: 45 },
  { hour: '10:00', executions: 67 },
  { hour: '12:00', executions: 78 },
  { hour: '14:00', executions: 82 },
  { hour: '16:00', executions: 71 },
  { hour: '18:00', executions: 59 },
  { hour: '20:00', executions: 34 },
  { hour: '22:00', executions: 23 },
]

export function AdvancedCharts() {
  const [timeRange, setTimeRange] = useState('7d')

  // In a real app, this would fetch actual data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        executionTrend: executionTrendData,
        workflowPerformance: workflowPerformanceData,
        statusDistribution: statusDistributionData,
        hourlyExecution: hourlyExecutionData,
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Analytics Dashboard
        </h2>
        <div className="flex space-x-2">
          {['24h', '7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Execution Trends */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Execution Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData?.executionTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={value => new Date(value).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={value => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="successful"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="Successful"
            />
            <Area
              type="monotone"
              dataKey="failed"
              stackId="1"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.6}
              name="Failed"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Workflow Performance */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Workflow Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.workflowPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="executions" fill="#3B82F6" name="Executions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Execution Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData?.statusDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
              >
                {analyticsData?.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Execution Pattern */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Hourly Execution Pattern
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={analyticsData?.hourlyExecution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="executions"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Detailed Performance Metrics
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Workflow
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Executions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Avg Duration (s)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {analyticsData?.workflowPerformance.map(workflow => (
                <tr key={workflow.name}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {workflow.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {workflow.executions}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {workflow.avgDuration}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        workflow.successRate >= 95
                          ? 'bg-green-100 text-green-800'
                          : workflow.successRate >= 90
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {workflow.successRate}%
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-16 rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${
                            workflow.successRate >= 95
                              ? 'bg-green-500'
                              : workflow.successRate >= 90
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${workflow.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">
                        {workflow.successRate >= 95
                          ? 'Excellent'
                          : workflow.successRate >= 90
                            ? 'Good'
                            : 'Needs Attention'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
