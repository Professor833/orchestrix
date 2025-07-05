import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { WorkflowBuilder } from '@/components/workflows/workflow-builder'

export default function NewWorkflowPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="Create New Workflow"
          text="Build your AI-powered workflow with our visual editor"
        />

        <div className="space-y-6">
          <WorkflowBuilder />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
