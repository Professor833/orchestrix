import React from 'react'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  className?: string
}

export function DashboardHeader({ heading, text, children, className }: DashboardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-2", className)}>
      <div className="grid gap-1">
        <h1 className="text-3xl font-bold text-gray-900">{heading}</h1>
        {text && (
          <p className="text-lg text-gray-600">{text}</p>
        )}
      </div>
      {children}
    </div>
  )
}
