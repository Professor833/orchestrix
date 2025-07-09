'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'
import { integrationService } from '@/lib/services/integrations'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, ExternalLink, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface IntegrationTemplate {
  id: string
  name: string
  service_name: string
  service_type: string
  description: string
  category: string
  icon: string
  configuration_schema: Record<string, any>
  credential_schema: Record<string, any>
  setup_instructions: string
  documentation_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface FormData {
  template_id: string
  display_name: string
  description: string
  credentials: Record<string, string>
  configuration: Record<string, any>
}

export function AddIntegrationForm() {
  const [step, setStep] = useState<'select' | 'configure'>('select')
  const [selectedTemplate, setSelectedTemplate] =
    useState<IntegrationTemplate | null>(null)
  const [formData, setFormData] = useState<FormData>({
    template_id: '',
    display_name: '',
    description: '',
    credentials: {},
    configuration: {},
  })
  const [showInstructions, setShowInstructions] = useState(false)

  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch integration templates
  const {
    data: templates,
    isLoading: templatesLoading,
    error: templatesError,
  } = useQuery({
    queryKey: ['integration-templates'],
    queryFn: () => integrationService.getIntegrationTemplates(),
  })

  // Create integration mutation
  const createIntegrationMutation = useMutation({
    mutationFn: (data: FormData) =>
      integrationService.createFromTemplate(data.template_id, {
        display_name: data.display_name,
        configuration: {
          ...data.configuration,
          credentials: data.credentials,
        },
      }),
    onSuccess: () => {
      toast.success('Integration created successfully!')
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      router.push('/integrations')
    },
    onError: (error: any) => {
      toast.error(
        'Failed to create integration: ' +
          (error.response?.data?.message || error.message)
      )
    },
  })

  const handleTemplateSelect = (template: IntegrationTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      template_id: template.id,
      display_name: template.name,
      description: template.description,
      credentials: {},
      configuration: {},
    })
    setStep('configure')
  }

  const handleInputChange = (
    field: string,
    value: string,
    type: 'credentials' | 'configuration'
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createIntegrationMutation.mutate(formData)
  }

  const renderCredentialField = (fieldName: string, fieldSchema: any) => {
    const isRequired = fieldSchema.required || false
    const isSecret =
      fieldName.toLowerCase().includes('secret') ||
      fieldName.toLowerCase().includes('token') ||
      fieldName.toLowerCase().includes('key')

    return (
      <div key={fieldName} className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {fieldSchema.title || fieldName}
          {isRequired && <span className="ml-1 text-red-500">*</span>}
        </label>
        <Input
          type={isSecret ? 'password' : 'text'}
          value={formData.credentials[fieldName] || ''}
          onChange={e =>
            handleInputChange(fieldName, e.target.value, 'credentials')
          }
          placeholder={
            fieldSchema.description || `Enter ${fieldSchema.title || fieldName}`
          }
          required={isRequired}
        />
        {fieldSchema.description && (
          <p className="text-xs text-gray-500">{fieldSchema.description}</p>
        )}
      </div>
    )
  }

  const renderConfigurationField = (fieldName: string, fieldSchema: any) => {
    const isRequired = fieldSchema.required || false

    if (fieldSchema.type === 'array') {
      return (
        <div key={fieldName} className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {fieldSchema.title || fieldName}
            {isRequired && <span className="ml-1 text-red-500">*</span>}
          </label>
          <Textarea
            value={
              formData.configuration[fieldName]
                ? JSON.stringify(formData.configuration[fieldName], null, 2)
                : ''
            }
            onChange={e => {
              try {
                const parsed = JSON.parse(e.target.value)
                handleInputChange(fieldName, parsed, 'configuration')
              } catch {
                // Keep the raw value for now
                handleInputChange(fieldName, e.target.value, 'configuration')
              }
            }}
            placeholder={
              fieldSchema.description ||
              `Enter ${fieldSchema.title || fieldName} (JSON array)`
            }
            rows={3}
          />
          {fieldSchema.description && (
            <p className="text-xs text-gray-500">{fieldSchema.description}</p>
          )}
        </div>
      )
    }

    return (
      <div key={fieldName} className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {fieldSchema.title || fieldName}
          {isRequired && <span className="ml-1 text-red-500">*</span>}
        </label>
        <Input
          type="text"
          value={formData.configuration[fieldName] || ''}
          onChange={e =>
            handleInputChange(fieldName, e.target.value, 'configuration')
          }
          placeholder={
            fieldSchema.description || `Enter ${fieldSchema.title || fieldName}`
          }
          required={isRequired}
        />
        {fieldSchema.description && (
          <p className="text-xs text-gray-500">{fieldSchema.description}</p>
        )}
      </div>
    )
  }

  if (templatesLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (templatesError) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500">Failed to load integration templates</p>
      </div>
    )
  }

  if (step === 'select') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Choose an Integration
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Select a service to connect to your workflow
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {templates?.map((template: IntegrationTemplate) => (
            <Card
              key={template.id}
              className="cursor-pointer transition-all hover:border-blue-200 hover:shadow-md"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 text-2xl">{template.icon}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {template.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {template.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {template.service_type}
                      </span>
                      {template.documentation_url && (
                        <a
                          href={template.documentation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Docs
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (step === 'configure' && selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Configure {selectedTemplate.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter your credentials and configuration
            </p>
          </div>
          <Button variant="outline" onClick={() => setStep('select')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {selectedTemplate.setup_instructions && (
          <Card className="border-blue-200 bg-blue-50">
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900">
                    Setup Instructions
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                  >
                    {showInstructions ? 'Hide' : 'Show'} instructions
                  </Button>
                  {showInstructions && (
                    <div className="mt-2 whitespace-pre-line text-sm text-blue-800">
                      {selectedTemplate.setup_instructions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="mb-4 text-base font-medium text-gray-900">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Display Name *
                  </label>
                  <Input
                    value={formData.display_name}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        display_name: e.target.value,
                      }))
                    }
                    placeholder="Enter a name for this integration"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </Card>

          {selectedTemplate.credential_schema?.properties && (
            <Card>
              <div className="p-6">
                <h3 className="mb-4 text-base font-medium text-gray-900">
                  Credentials
                </h3>
                <div className="space-y-4">
                  {Object.entries(
                    selectedTemplate.credential_schema.properties
                  ).map(([fieldName, fieldSchema]) =>
                    renderCredentialField(fieldName, fieldSchema)
                  )}
                </div>
              </div>
            </Card>
          )}

          {selectedTemplate.configuration_schema?.properties && (
            <Card>
              <div className="p-6">
                <h3 className="mb-4 text-base font-medium text-gray-900">
                  Configuration
                </h3>
                <div className="space-y-4">
                  {Object.entries(
                    selectedTemplate.configuration_schema.properties
                  ).map(([fieldName, fieldSchema]) =>
                    renderConfigurationField(fieldName, fieldSchema)
                  )}
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('select')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createIntegrationMutation.isPending}
            >
              {createIntegrationMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Integration
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return null
}
