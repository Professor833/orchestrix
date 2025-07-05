'use client'

import { NotificationCenter } from '@/components/notifications/notification-center'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { LogOut, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface HeaderProps {
  children?: ReactNode
  className?: string
  title?: string
}

export function Header({ children, className, title }: HeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const handleProfile = () => {
    // router.push('/profile')
    console.log('Profile clicked')
  }

  const handleSettings = () => {
    // router.push('/settings')
    console.log('Settings clicked')
  }

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6',
        className
      )}
    >
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          {title || 'Dashboard'}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <NotificationCenter />

        {/* User menu */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500">
                {user?.subscription_tier || 'Free'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleProfile}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              title="Profile"
            >
              <User className="h-4 w-4" />
            </button>
            <button
              onClick={handleSettings}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </header>
  )
}
