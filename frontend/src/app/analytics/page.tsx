import { AdvancedCharts } from '@/components/analytics/advanced-charts'
import { AnalyticsMetrics } from '@/components/analytics/analytics-metrics'
import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default function AnalyticsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="Analytics"
          text="Monitor performance and insights for your workflows"
        />

        <div className="space-y-6">
          <AnalyticsMetrics />
          <AdvancedCharts />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
