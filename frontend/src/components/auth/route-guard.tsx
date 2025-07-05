'use client'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function RouteGuard({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
}: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading) {
      if (requireAuth && !isAuthenticated) {
        window.location.href = redirectTo
      } else if (!requireAuth && isAuthenticated) {
        window.location.href = '/'
      }
    }
  }, [mounted, isAuthenticated, isLoading, requireAuth, redirectTo])

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If auth is required and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If auth is not required but user is authenticated, don't render children
  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export default RouteGuard
