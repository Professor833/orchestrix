'use client'

import { cn } from '@/lib/utils'
import {
  Activity,
  BarChart3,
  FileText,
  Home,
  Puzzle,
  Settings,
  Users,
  Workflow,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface SidebarProps {
  children?: ReactNode
  className?: string
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Templates', href: '/workflows/templates', icon: FileText },
  { name: 'Executions', href: '/executions', icon: Activity },
  { name: 'Integrations', href: '/integrations', icon: Puzzle },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Monitoring', href: '/monitoring', icon: Activity },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'API Docs', href: '/api-docs', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ children, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-gray-50',
        className
      )}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="ml-3 text-lg font-semibold text-gray-900">
            Orchestrix
          </h2>
        </div>
      </div>

      <nav className="flex-1 px-6 pb-6">
        <div className="space-y-1">
          {navigation.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href as any}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {children}
    </aside>
  )
}
