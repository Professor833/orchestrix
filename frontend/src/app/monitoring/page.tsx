import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { PerformanceMonitor } from '@/components/monitoring/performance-monitor'

export default function MonitoringPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="System Monitoring"
          text="Monitor system performance and health metrics in real-time"
        />

        <div className="space-y-6">
          <PerformanceMonitor />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
