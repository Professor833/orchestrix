import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { UserManagement } from '@/components/users/user-management'

export default function UsersPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="User Management"
          text="Manage users, roles, and permissions across your organization"
        />

        <div className="space-y-6">
          <UserManagement />
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
