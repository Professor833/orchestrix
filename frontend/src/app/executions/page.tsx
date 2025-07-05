import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { ExecutionFilters } from '@/components/executions/execution-filters'
import { ExecutionList } from '@/components/executions/execution-list'

export default function ExecutionsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="Executions"
          text="Monitor and track your workflow executions"
        />

        <div className="space-y-6">
          <ExecutionFilters />
          <ExecutionList />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
