import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { AddIntegrationForm } from '@/components/integrations/add-integration-form'

export default function NewIntegrationPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="Add Integration"
          text="Connect a new service to your workflow automation platform"
        />

        <div className="space-y-6">
          <AddIntegrationForm />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
