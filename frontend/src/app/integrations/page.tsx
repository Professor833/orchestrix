import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { IntegrationCategories } from '@/components/integrations/integration-categories'
import { IntegrationListSimple } from '@/components/integrations/integration-list-simple'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function IntegrationsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="Integrations"
          text="Connect and manage your third-party integrations"
        >
          <Link href="/integrations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Integration
            </Button>
          </Link>
        </DashboardHeader>

        <div className="space-y-6">
          <IntegrationCategories />
          <IntegrationListSimple />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
