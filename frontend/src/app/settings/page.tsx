import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { SettingsTabs } from '@/components/settings/settings-tabs'

export default function SettingsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="Settings"
          text="Manage your account settings and preferences"
        />

        <div className="space-y-6">
          <SettingsTabs />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
