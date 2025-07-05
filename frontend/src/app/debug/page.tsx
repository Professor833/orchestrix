'use client'

export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Environment Debug</h1>
      <div className="space-y-2">
        <p>
          <strong>Client-side NEXT_PUBLIC_API_URL:</strong>{' '}
          {process.env.NEXT_PUBLIC_API_URL || 'undefined'}
        </p>
        <p>
          <strong>Expected:</strong> http://localhost:8000/api/v1
        </p>
        <p>
          <strong>Match:</strong>{' '}
          {process.env.NEXT_PUBLIC_API_URL === 'http://localhost:8000/api/v1'
            ? 'YES'
            : 'NO'}
        </p>
      </div>
    </div>
  )
}
