'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'
import { workflowService } from '@/lib/services'
import { Workflow, WorkflowTemplate } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  BrainCircuit,
  Code,
  Workflow as WorkflowIcon,
} from 'lucide-react'
import { Route } from 'next'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'trigger':
      return <WorkflowIcon className="mr-2 h-5 w-5 text-blue-500" />
    case 'action':
      return <BrainCircuit className="mr-2 h-5 w-5 text-green-500" />
    case 'condition':
      return <Code className="mr-2 h-5 w-5 text-purple-500" />
    default:
      return <WorkflowIcon className="mr-2 h-5 w-5" />
  }
}

export default function WorkflowTemplateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()

  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')

  const {
    data: template,
    isLoading,
    isError,
    error,
  } = useQuery<WorkflowTemplate, Error>({
    queryKey: ['workflowTemplate', id],
    queryFn: () => workflowService.getWorkflowTemplate(id),
    enabled: !!id,
  })

  useEffect(() => {
    if (template) {
      setWorkflowName(`New Workflow from ${template.name}`)
      setWorkflowDescription(template.description)
    }
  }, [template])

  const createFromTemplateMutation = useMutation<
    Workflow,
    Error,
    { name: string; description: string }
  >({
    mutationFn: (data: { name: string; description: string }) =>
      workflowService.createWorkflowFromTemplate(
        id,
        data.name,
        data.description
      ),
    onSuccess: newWorkflow => {
      toast.success('Workflow created successfully from template!')
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      router.push(`/workflows/${newWorkflow.id}` as Route)
    },
    onError: (error: any) => {
      toast.error('Failed to create workflow', {
        description: error.response?.data?.detail || error.message,
      })
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load workflow template. {error?.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The requested workflow template could not be found.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleCreateWorkflow = () => {
    if (!workflowName.trim()) {
      toast.warning('Please provide a name for the new workflow.')
      return
    }
    createFromTemplateMutation.mutate({
      name: workflowName,
      description: workflowDescription,
    })
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Templates
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold">
                <WorkflowIcon className="mr-3 h-6 w-6" />
                {template.name}
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary">{template.category}</Badge>
                <Badge variant="outline">
                  {template.nodes?.length || template.node_configs?.length || 0}{' '}
                  nodes
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="mb-4 text-lg font-semibold">Workflow Nodes</h3>
              <div className="space-y-4">
                {template.nodes?.length || template.node_configs?.length ? (
                  (template.nodes?.length
                    ? template.nodes
                    : template.node_configs || []
                  ).map((node: any) => (
                    <div
                      key={node.id || `node-${node.name}`}
                      className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800"
                    >
                      <div className="flex items-center font-semibold">
                        {getNodeIcon(node.node_type)}
                        {node.name}
                        <Badge variant="outline" className="ml-auto">
                          {node.node_type}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {node.description ||
                          (node.configuration &&
                            node.configuration.description) ||
                          ''}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border bg-gray-50 p-4 text-center dark:bg-gray-800">
                    <p className="text-sm text-muted-foreground">
                      This template doesn't have any nodes defined yet.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create Workflow</CardTitle>
              <CardDescription>
                Use this template to create a new workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="workflowName"
                  className="mb-1 block text-sm font-medium"
                >
                  Workflow Name
                </label>
                <Input
                  id="workflowName"
                  value={workflowName}
                  onChange={e => setWorkflowName(e.target.value)}
                  placeholder="e.g., My New Automated Task"
                />
              </div>
              <div>
                <label
                  htmlFor="workflowDescription"
                  className="mb-1 block text-sm font-medium"
                >
                  Description (Optional)
                </label>
                <Textarea
                  id="workflowDescription"
                  value={workflowDescription}
                  onChange={e => setWorkflowDescription(e.target.value)}
                  placeholder="A brief description of what this workflow does."
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleCreateWorkflow}
                disabled={createFromTemplateMutation.isPending}
                className="w-full"
              >
                {createFromTemplateMutation.isPending && (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                )}
                Create Workflow from Template
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
