'use client'

import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Button } from '@/components/ui/button'
import { WorkflowActions } from '@/components/workflows/workflow-actions'
import { WorkflowFilters } from '@/components/workflows/workflow-filters'
import { WorkflowList } from '@/components/workflows/workflow-list'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function WorkflowsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="Workflows"
          text="Create, manage, and monitor your AI workflows"
        >
          <Link href="/workflows/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </Link>
        </DashboardHeader>

        <div className="space-y-6">
          <WorkflowFilters />
          <WorkflowActions />
          <WorkflowList />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
