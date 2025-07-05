'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function ApiFallback() {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>API Schema Unavailable</AlertTitle>
        <AlertDescription>
          The API schema could not be loaded. You can still access the API
          documentation through the links below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Our API documentation is available in multiple formats. You can
              access them directly from the backend server:
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

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Here's a quick overview of the main API endpoints available in
              Orchestrix:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>/api/v1/auth/</strong> - Authentication endpoints
                (login, refresh, register)
              </li>
              <li>
                <strong>/api/v1/workflows/</strong> - Workflow management
                endpoints
              </li>
              <li>
                <strong>/api/v1/workflows/templates/</strong> - Workflow
                templates
              </li>
              <li>
                <strong>/api/v1/executions/</strong> - Workflow execution
                management
              </li>
              <li>
                <strong>/api/v1/integrations/</strong> - Integration management
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
