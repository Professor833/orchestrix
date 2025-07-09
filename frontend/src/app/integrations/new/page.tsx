import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { AddIntegrationForm } from '@/components/integrations/add-integration-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewIntegrationPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="Add Integration"
          text="Connect a new service to your workflow"
        >
          <Link href="/integrations">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Integrations
            </Button>
          </Link>
        </DashboardHeader>

        <div className="mx-auto max-w-2xl">
          <AddIntegrationForm />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
