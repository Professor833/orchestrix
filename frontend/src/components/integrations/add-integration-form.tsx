'use client'

import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { integrationService } from '@/lib/services/integrations'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Plus,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface IntegrationTemplate {
  id: string
  name: string
  service_name: string
  service_type: string
  description: string
  configuration_schema: Record<string, any>
  credential_schema: Record<string, any>
  setup_instructions: string
  icon: string
  documentation_url: string
  is_active: boolean
}

interface IntegrationCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export function AddIntegrationForm() {
  const [step, setStep] = useState<'category' | 'template' | 'configure'>(
    'category'
  )
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] =
    useState<IntegrationTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [showCredentials, setShowCredentials] = useState<
    Record<string, boolean>
  >({})
  const [isCreating, setIsCreating] = useState(false)

  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch integration categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['integration-categories'],
    queryFn: () => integrationService.getIntegrationCategories(),
  })

  // Fetch integration templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['integration-templates', selectedCategory],
    queryFn: () =>
      integrationService.getIntegrationTemplates(selectedCategory || undefined),
    enabled: step === 'template',
  })

  // Create integration mutation
  const createIntegrationMutation = useMutation({
    mutationFn: (data: any) => integrationService.createIntegration(data),
    onSuccess: newIntegration => {
      toast.success('Integration created successfully!')
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      router.push(`/integrations/${newIntegration.id}`)
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create integration'
      )
    },
  })

  const filteredTemplates = templates?.filter(
    template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setStep('template')
  }

  const handleTemplateSelect = (template: IntegrationTemplate) => {
    setSelectedTemplate(template)
    setStep('configure')

    // Initialize form data with default values
    const initialData: Record<string, any> = {
      service_name: template.service_name,
      service_type: template.service_type,
      display_name: template.name,
      description: template.description,
      configuration: {},
      credentials: {},
    }

    // Set default values from schema
    if (template.configuration_schema?.properties) {
      Object.entries(template.configuration_schema.properties).forEach(
        ([key, schema]: [string, any]) => {
          if (schema.default !== undefined) {
            initialData.configuration[key] = schema.default
          }
        }
      )
    }

    setFormData(initialData)
  }

  const handleInputChange = (
    section: 'configuration' | 'credentials',
    key: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return

    setIsCreating(true)
    try {
      await createIntegrationMutation.mutateAsync({
        service_name: formData.service_name,
        service_type: formData.service_type,
        display_name: formData.display_name,
        description: formData.description,
        configuration: formData.configuration,
        credentials: formData.credentials,
        category: selectedCategory,
      })
    } catch (error) {
      console.error('Error creating integration:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const toggleCredentialVisibility = (key: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const renderFormField = (
    section: 'configuration' | 'credentials',
    key: string,
    schema: any,
    isRequired: boolean = false
  ) => {
    const value = formData[section]?.[key] || ''
    const isCredential = section === 'credentials'
    const isPassword =
      isCredential ||
      schema.type === 'password' ||
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('token')
    const showValue = !isPassword || showCredentials[key]

    return (
      <div key={key} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {schema.title ||
            key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l: string) => l.toUpperCase())}
          {isRequired && <span className="ml-1 text-red-500">*</span>}
        </label>

        {schema.description && (
          <p className="text-xs text-gray-500">{schema.description}</p>
        )}

        <div className="relative">
          {schema.type === 'select' || schema.enum ? (
            <select
              value={value}
              onChange={e => handleInputChange(section, key, e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              required={isRequired}
            >
              <option value="">Select an option</option>
              {(schema.enum || schema.options || []).map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : schema.type === 'textarea' ? (
            <textarea
              value={value}
              onChange={e => handleInputChange(section, key, e.target.value)}
              placeholder={schema.placeholder || ''}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required={isRequired}
            />
          ) : (
            <input
              type={showValue ? 'text' : 'password'}
              value={value}
              onChange={e => handleInputChange(section, key, e.target.value)}
              placeholder={schema.placeholder || ''}
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-blue-500"
              required={isRequired}
            />
          )}

          {isPassword && (
            <button
              type="button"
              onClick={() => toggleCredentialVisibility(key)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showValue ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (categoriesLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-2 ${step === 'category' ? 'text-blue-600' : step === 'template' || step === 'configure' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'category' ? 'bg-blue-100' : step === 'template' || step === 'configure' ? 'bg-green-100' : 'bg-gray-100'}`}
            >
              {step === 'template' || step === 'configure' ? (
                <Check className="h-4 w-4" />
              ) : (
                '1'
              )}
            </div>
            <span className="font-medium">Choose Category</span>
          </div>

          <div className="h-px flex-1 bg-gray-200" />

          <div
            className={`flex items-center space-x-2 ${step === 'template' ? 'text-blue-600' : step === 'configure' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'template' ? 'bg-blue-100' : step === 'configure' ? 'bg-green-100' : 'bg-gray-100'}`}
            >
              {step === 'configure' ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className="font-medium">Select Service</span>
          </div>

          <div className="h-px flex-1 bg-gray-200" />

          <div
            className={`flex items-center space-x-2 ${step === 'configure' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'configure' ? 'bg-blue-100' : 'bg-gray-100'}`}
            >
              3
            </div>
            <span className="font-medium">Configure</span>
          </div>
        </div>
      </div>

      {/* Step 1: Category Selection */}
      {step === 'category' && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-lg font-medium text-gray-900">
              Choose Integration Category
            </h2>
            <p className="text-gray-600">
              Select the type of service you want to integrate
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories?.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="rounded-lg border border-gray-200 p-6 text-left transition-all hover:border-blue-500 hover:shadow-md"
              >
                <div className="mb-3 flex items-center space-x-3">
                  <div
                    className={`rounded-lg p-2`}
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <div className="h-6 w-6" style={{ color: category.color }}>
                      {/* You can add category icons here */}
                      <div className="h-full w-full rounded bg-current" />
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{category.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Template Selection */}
      {step === 'template' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-lg font-medium text-gray-900">
                Select Integration Service
              </h2>
              <p className="text-gray-600">
                Choose from available integrations
              </p>
            </div>
            <Button variant="outline" onClick={() => setStep('category')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {templatesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredTemplates?.map(template => (
                <div
                  key={template.id}
                  className="rounded-lg border border-gray-200 p-6 transition-all hover:border-blue-500 hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        {template.icon ? (
                          <img
                            src={template.icon}
                            alt={template.name}
                            className="h-6 w-6"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded bg-blue-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {template.service_type}
                        </p>
                      </div>
                    </div>
                    {template.documentation_url && (
                      <a
                        href={template.documentation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <p className="mb-4 text-sm text-gray-600">
                    {template.description}
                  </p>

                  {template.setup_instructions && (
                    <div className="mb-4 rounded-md bg-blue-50 p-3">
                      <div className="flex items-start space-x-2">
                        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <p className="text-xs text-blue-800">
                          {template.setup_instructions}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add {template.name}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {filteredTemplates?.length === 0 && !templatesLoading && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No integrations found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Configuration */}
      {step === 'configure' && selectedTemplate && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-lg font-medium text-gray-900">
                Configure {selectedTemplate.name}
              </h2>
              <p className="text-gray-600">
                Set up your integration credentials and configuration
              </p>
            </div>
            <Button variant="outline" onClick={() => setStep('template')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-md mb-4 font-medium text-gray-900">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.display_name || ''}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        display_name: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Service Type
                  </label>
                  <input
                    type="text"
                    value={formData.service_type || ''}
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                    disabled
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Credentials */}
            {selectedTemplate.credential_schema?.properties &&
              Object.keys(selectedTemplate.credential_schema.properties)
                .length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <div className="mb-4 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <h3 className="text-md font-medium text-gray-900">
                      Credentials
                    </h3>
                  </div>
                  <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm text-amber-800">
                      Your credentials will be encrypted and stored securely.
                      They are only used to authenticate with the external
                      service.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Object.entries(
                      selectedTemplate.credential_schema.properties
                    ).map(([key, schema]: [string, any]) =>
                      renderFormField(
                        'credentials',
                        key,
                        schema,
                        selectedTemplate.credential_schema.required?.includes(
                          key
                        )
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Configuration */}
            {selectedTemplate.configuration_schema?.properties &&
              Object.keys(selectedTemplate.configuration_schema.properties)
                .length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="text-md mb-4 font-medium text-gray-900">
                    Configuration
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Object.entries(
                      selectedTemplate.configuration_schema.properties
                    ).map(([key, schema]: [string, any]) =>
                      renderFormField(
                        'configuration',
                        key,
                        schema,
                        selectedTemplate.configuration_schema.required?.includes(
                          key
                        )
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Submit */}
            <div className="flex items-center justify-between">
              <Link href="/integrations">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating Integration...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Integration
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
