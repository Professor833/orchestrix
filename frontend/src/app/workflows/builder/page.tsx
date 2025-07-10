'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const WorkflowBuilder = dynamic(
  () => import('@/components/workflow-builder').then(mod => ({ default: mod.WorkflowBuilder })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow builder...</p>
        </div>
      </div>
    )
  }
)

export default function WorkflowBuilderPage() {
  const handleSave = (data: any) => {
    console.log('Saving workflow:', data)
    // TODO: Implement actual save logic
  }

  const handleTest = (data: any) => {
    console.log('Testing workflow:', data)
    // TODO: Implement actual test logic
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Workflow Builder</h1>
        <p className="text-muted-foreground">
          Create and manage your AI workflow automations
        </p>
      </div>

      <div className="border rounded-lg">
        <Suspense fallback={
          <div className="flex h-[600px] items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading workflow builder...</p>
            </div>
          </div>
        }>
          <WorkflowBuilder
            onSave={handleSave}
            onTest={handleTest}
          />
        </Suspense>
      </div>
    </div>
  )
}
