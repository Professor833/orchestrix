'use client'

import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  RefreshCw,
  Server,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

interface PerformanceMetrics {
  system: {
    cpu_usage: number
    memory_usage: number
    disk_usage: number
    network_io: number
  }
  application: {
    active_executions: number
    queue_size: number
    average_response_time: number
    error_rate: number
  }
  database: {
    connection_pool: number
    query_time: number
    active_connections: number
  }
  alerts: Array<{
    id: string
    type: 'warning' | 'error' | 'info'
    message: string
    timestamp: string
    resolved: boolean
  }>
}

export function PerformanceMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000)

  const {
    data: metrics,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async (): Promise<PerformanceMetrics> => {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        system: {
          cpu_usage: Math.random() * 100,
          memory_usage: Math.random() * 100,
          disk_usage: Math.random() * 100,
          network_io: Math.random() * 1000,
        },
        application: {
          active_executions: Math.floor(Math.random() * 50),
          queue_size: Math.floor(Math.random() * 100),
          average_response_time: Math.random() * 1000,
          error_rate: Math.random() * 5,
        },
        database: {
          connection_pool: Math.floor(Math.random() * 20),
          query_time: Math.random() * 100,
          active_connections: Math.floor(Math.random() * 50),
        },
        alerts: [
          {
            id: '1',
            type: 'warning',
            message: 'High CPU usage detected on server node-1',
            timestamp: new Date().toISOString(),
            resolved: false,
          },
          {
            id: '2',
            type: 'error',
            message: 'Database connection timeout',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            resolved: true,
          },
        ],
      }
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
  })

  const getStatusColor = (
    value: number,
    thresholds: { warning: number; critical: number }
  ) => {
    if (value >= thresholds.critical) return 'text-red-600 bg-red-100'
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStatusIcon = (
    value: number,
    thresholds: { warning: number; critical: number }
  ) => {
    if (value >= thresholds.critical)
      return <AlertTriangle className="h-5 w-5 text-red-600" />
    if (value >= thresholds.warning)
      return <Clock className="h-5 w-5 text-yellow-600" />
    return <CheckCircle className="h-5 w-5 text-green-600" />
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Performance Monitor
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              Auto Refresh
            </label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <select
            value={refreshInterval}
            onChange={e => setRefreshInterval(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.system.cpu_usage.toFixed(1)}%
              </p>
            </div>
            <div
              className={`rounded-full p-3 ${getStatusColor(metrics?.system.cpu_usage || 0, { warning: 70, critical: 90 })}`}
            >
              <Server className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              {getStatusIcon(metrics?.system.cpu_usage || 0, {
                warning: 70,
                critical: 90,
              })}
              <span className="ml-2 text-sm text-gray-600">
                {metrics?.system.cpu_usage && metrics.system.cpu_usage > 70
                  ? 'High usage'
                  : 'Normal'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.system.memory_usage.toFixed(1)}%
              </p>
            </div>
            <div
              className={`rounded-full p-3 ${getStatusColor(metrics?.system.memory_usage || 0, { warning: 75, critical: 90 })}`}
            >
              <Database className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              {getStatusIcon(metrics?.system.memory_usage || 0, {
                warning: 75,
                critical: 90,
              })}
              <span className="ml-2 text-sm text-gray-600">
                {formatBytes(
                  ((metrics?.system.memory_usage || 0) * 1024 * 1024 * 1024) /
                    100
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Executions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.application.active_executions}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="ml-2 text-sm text-gray-600">
                Queue: {metrics?.application.queue_size}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.application.average_response_time.toFixed(0)}ms
              </p>
            </div>
            <div
              className={`rounded-full p-3 ${getStatusColor(metrics?.application.average_response_time || 0, { warning: 500, critical: 1000 })}`}
            >
              <Zap className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              {metrics?.application.average_response_time &&
              metrics.application.average_response_time > 500 ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-green-600" />
              )}
              <span className="ml-2 text-sm text-gray-600">
                Error Rate: {metrics?.application.error_rate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Metrics */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Database Performance
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {metrics?.database.connection_pool}
            </div>
            <div className="text-sm text-gray-600">Connection Pool</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {metrics?.database.query_time.toFixed(1)}ms
            </div>
            <div className="text-sm text-gray-600">Avg Query Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {metrics?.database.active_connections}
            </div>
            <div className="text-sm text-gray-600">Active Connections</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          System Alerts
        </h2>
        <div className="space-y-3">
          {metrics?.alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-center justify-between rounded-lg p-3 ${
                alert.type === 'error'
                  ? 'border border-red-200 bg-red-50'
                  : alert.type === 'warning'
                    ? 'border border-yellow-200 bg-yellow-50'
                    : 'border border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {alert.type === 'error' ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : alert.type === 'warning' ? (
                  <Clock className="h-5 w-5 text-yellow-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    alert.resolved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {alert.resolved ? 'Resolved' : 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
