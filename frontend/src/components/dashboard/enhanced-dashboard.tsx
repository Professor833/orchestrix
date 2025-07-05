'use client'

import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function EnhancedDashboard() {
  const [timeRange, setTimeRange] = useState('7d')

  // Mock data to avoid API dependency issues
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', timeRange],
    queryFn: async () => {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        totalWorkflows: 24,
        activeWorkflows: 18,
        totalExecutions: 1847,
        successfulExecutions: 1654,
        failedExecutions: 89,
        runningExecutions: 12,
        successRate: 89,
      }
    },
  })

  // Mock recent executions
  const { data: recentExecutions, isLoading: executionsLoading } = useQuery({
    queryKey: ['recent-executions'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        results: [
          {
            id: 'exec-001',
            status: 'completed',
            started_at: new Date(Date.now() - 300000).toISOString(),
            workflow: { name: 'Email Campaign' },
          },
          {
            id: 'exec-002',
            status: 'running',
            started_at: new Date(Date.now() - 60000).toISOString(),
            workflow: { name: 'Data Sync' },
          },
          {
            id: 'exec-003',
            status: 'completed',
            started_at: new Date(Date.now() - 900000).toISOString(),
            workflow: { name: 'Report Generator' },
          },
          {
            id: 'exec-004',
            status: 'failed',
            started_at: new Date(Date.now() - 1200000).toISOString(),
            workflow: { name: 'Backup Process' },
          },
          {
            id: 'exec-005',
            status: 'completed',
            started_at: new Date(Date.now() - 1800000).toISOString(),
            workflow: { name: 'Slack Alerts' },
          },
        ],
      }
    },
  })

  const quickStats = [
    {
      name: 'Total Workflows',
      value: stats?.totalWorkflows || 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Workflows',
      value: stats?.activeWorkflows || 0,
      change: '+8%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Executions',
      value: stats?.totalExecutions || 0,
      change: '+23%',
      changeType: 'positive' as const,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Success Rate',
      value: `${stats?.successRate || 0}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ]

  const executionStats = [
    {
      name: 'Running',
      value: stats?.runningExecutions || 0,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Completed',
      value: stats?.successfulExecutions || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Failed',
      value: stats?.failedExecutions || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map(stat => (
          <div
            key={stat.name}
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? <LoadingSpinner size="sm" /> : stat.value}
                </p>
                <div className="mt-2 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {stat.change}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    vs last period
                  </span>
                </div>
              </div>
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Status Overview */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Execution Status
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {executionStats.map(stat => (
            <div key={stat.name} className={`rounded-lg p-4 ${stat.bgColor}`}>
              <div className="flex items-center space-x-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {stat.name}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {statsLoading ? <LoadingSpinner size="sm" /> : stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Executions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Executions
            </h2>
            <Link href="/executions">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          {executionsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {recentExecutions?.results?.slice(0, 5).map(execution => (
                <div
                  key={execution.id}
                  className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex-shrink-0">
                    {execution.status === 'running' && (
                      <Clock className="h-4 w-4 text-blue-600" />
                    )}
                    {execution.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {execution.status === 'failed' && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {execution.workflow?.name ||
                        `Execution #${execution.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(execution.started_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        execution.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : execution.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {execution.status}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="py-8 text-center text-gray-500">
                  No recent executions
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Workflows */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Workflows
            </h2>
            <Link href="/workflows">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {[
              {
                name: 'Email Campaign',
                status: 'active',
                updated: '2 hours ago',
              },
              { name: 'Data Sync', status: 'active', updated: '4 hours ago' },
              {
                name: 'Report Generator',
                status: 'paused',
                updated: '1 day ago',
              },
              {
                name: 'Backup Process',
                status: 'active',
                updated: '2 days ago',
              },
              { name: 'Slack Alerts', status: 'active', updated: '3 days ago' },
            ].map((workflow, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3"
              >
                <div className="flex-shrink-0">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {workflow.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Updated {workflow.updated}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      workflow.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {workflow.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link href="/workflows/new">
            <Button className="h-20 w-full flex-col space-y-2">
              <Zap className="h-6 w-6" />
              <span>Create Workflow</span>
            </Button>
          </Link>
          <Link href="/integrations">
            <Button
              variant="outline"
              className="h-20 w-full flex-col space-y-2"
            >
              <Users className="h-6 w-6" />
              <span>Manage Integrations</span>
            </Button>
          </Link>
          <Link href="/analytics">
            <Button
              variant="outline"
              className="h-20 w-full flex-col space-y-2"
            >
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
