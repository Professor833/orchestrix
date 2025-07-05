'use client'

import { ApiDocumentation } from '@/components/api/api-documentation'
import { ApiFallback } from '@/components/api/api-fallback'
import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ApiDocsPage() {
  const [schemaLoaded, setSchemaLoaded] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if the API schema is available
    fetch('http://localhost:8000/api/schema/')
      .then(response => {
        setSchemaLoaded(response.ok)
      })
      .catch(() => {
        setSchemaLoaded(false)
      })
  }, [])

  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>
        <DashboardHeader
          heading="API Documentation"
          text="Explore and test the Orchestrix API endpoints"
        />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Access the interactive API documentation for Orchestrix
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Our API documentation is available in multiple formats. You
                  can choose the one that works best for you:
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="http://localhost:8000/api/docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Swagger UI
                    </Button>
                  </Link>
                  <Link
                    href="http://localhost:8000/api/redoc/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      ReDoc
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {schemaLoaded === false ? <ApiFallback /> : <ApiDocumentation />}
        </div>
      </DashboardShell>
    </RouteGuard>
  )
}
