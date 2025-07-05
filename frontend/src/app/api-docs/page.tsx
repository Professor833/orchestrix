import { ApiDocumentation } from '@/components/api/api-documentation'
import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default function ApiDocsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="API Documentation"
          text="Explore and test the Orchestrix API endpoints"
        />

        <div className="space-y-6">
          <ApiDocumentation />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
