import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { ExecutionDetails } from '@/components/executions/execution-details'

interface ExecutionPageProps {
  params: {
    id: string
  }
}

export default function ExecutionPage({ params }: ExecutionPageProps) {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="Execution Details"
          text="View detailed information about this workflow execution"
        />

        <div className="space-y-6">
          <ExecutionDetails executionId={params.id} />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
