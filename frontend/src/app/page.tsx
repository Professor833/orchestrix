import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { EnhancedDashboard } from '@/components/dashboard/enhanced-dashboard'

export default function HomePage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <EnhancedDashboard />
      </DashboardShell>
    </RouteGuard>
  )
}
