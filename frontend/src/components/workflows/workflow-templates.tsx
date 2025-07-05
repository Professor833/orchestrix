'use client'

import { Button } from '@/components/ui/button'
import { workflowService } from '@/lib/services/workflows'
import {
  BarChart3,
  Calendar,
  Clock,
  Database,
  Download,
  Eye,
  Mail,
  MessageSquare,
  Search,
  Shield,
  Star,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: any
  color: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: string
  usageCount: number
  rating: number
  tags: string[]
  definition: any
}

const templates: WorkflowTemplate[] = [
  {
    id: '1',
    name: 'Email Newsletter Automation',
    description:
      'Automatically send personalized newsletters to your subscribers with dynamic content',
    category: 'Marketing',
    icon: Mail,
    color: 'bg-blue-100 text-blue-600',
    difficulty: 'Beginner',
    estimatedTime: '15 min',
    usageCount: 1247,
    rating: 4.8,
    tags: ['email', 'marketing', 'automation'],
    definition: {
      nodes: [
        { type: 'trigger', name: 'Schedule Trigger' },
        { type: 'action', name: 'Fetch Subscriber List' },
        { type: 'action', name: 'Generate Content' },
        { type: 'action', name: 'Send Email' },
      ],
    },
  },
  {
    id: '2',
    name: 'Data Backup & Sync',
    description:
      'Automatically backup important data and sync across multiple cloud storage services',
    category: 'Data Management',
    icon: Database,
    color: 'bg-green-100 text-green-600',
    difficulty: 'Intermediate',
    estimatedTime: '30 min',
    usageCount: 892,
    rating: 4.6,
    tags: ['backup', 'sync', 'cloud', 'data'],
    definition: {
      nodes: [
        { type: 'trigger', name: 'File Change Trigger' },
        { type: 'action', name: 'Create Backup' },
        { type: 'action', name: 'Upload to Cloud' },
        { type: 'condition', name: 'Verify Upload' },
      ],
    },
  },
  {
    id: '3',
    name: 'Slack Alert System',
    description:
      'Monitor system metrics and send alerts to Slack when thresholds are exceeded',
    category: 'Monitoring',
    icon: MessageSquare,
    color: 'bg-purple-100 text-purple-600',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    usageCount: 654,
    rating: 4.7,
    tags: ['slack', 'monitoring', 'alerts'],
    definition: {
      nodes: [
        { type: 'trigger', name: 'Metric Trigger' },
        { type: 'condition', name: 'Check Threshold' },
        { type: 'action', name: 'Format Message' },
        { type: 'action', name: 'Send to Slack' },
      ],
    },
  },
  {
    id: '4',
    name: 'Meeting Scheduler',
    description:
      'Automatically schedule meetings based on availability and send calendar invites',
    category: 'Productivity',
    icon: Calendar,
    color: 'bg-yellow-100 text-yellow-600',
    difficulty: 'Advanced',
    estimatedTime: '45 min',
    usageCount: 423,
    rating: 4.5,
    tags: ['calendar', 'scheduling', 'meetings'],
    definition: {
      nodes: [
        { type: 'trigger', name: 'Meeting Request' },
        { type: 'action', name: 'Check Availability' },
        { type: 'action', name: 'Create Event' },
        { type: 'action', name: 'Send Invites' },
      ],
    },
  },
  {
    id: '5',
    name: 'Report Generator',
    description:
      'Generate automated reports from multiple data sources and distribute to stakeholders',
    category: 'Analytics',
    icon: BarChart3,
    color: 'bg-red-100 text-red-600',
    difficulty: 'Advanced',
    estimatedTime: '60 min',
    usageCount: 312,
    rating: 4.9,
    tags: ['reports', 'analytics', 'data'],
    definition: {
      nodes: [
        { type: 'trigger', name: 'Schedule Trigger' },
        { type: 'action', name: 'Collect Data' },
        { type: 'action', name: 'Generate Report' },
        { type: 'action', name: 'Distribute Report' },
      ],
    },
  },
  {
    id: '6',
    name: 'Security Audit Log',
    description:
      'Monitor security events and maintain audit logs with automated compliance reporting',
    category: 'Security',
    icon: Shield,
    color: 'bg-gray-100 text-gray-600',
    difficulty: 'Advanced',
    estimatedTime: '90 min',
    usageCount: 156,
    rating: 4.4,
    tags: ['security', 'audit', 'compliance'],
    definition: {
      nodes: [
        { type: 'trigger', name: 'Security Event' },
        { type: 'action', name: 'Log Event' },
        { type: 'condition', name: 'Check Severity' },
        { type: 'action', name: 'Generate Alert' },
      ],
    },
  },
]

const categories = [
  'All',
  'Marketing',
  'Data Management',
  'Monitoring',
  'Productivity',
  'Analytics',
  'Security',
]

export function WorkflowTemplates() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const router = useRouter()

  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesCategory =
      selectedCategory === 'All' || template.category === selectedCategory
    const matchesDifficulty =
      selectedDifficulty === 'All' || template.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleUseTemplate = async (template: WorkflowTemplate) => {
    try {
      const workflowData = {
        name: `${template.name} (from template)`,
        description: template.description,
        definition: template.definition,
        is_active: false,
      }

      await workflowService.createWorkflow(workflowData)
      toast.success('Workflow created from template!')
      router.push('/workflows')
    } catch (error) {
      toast.error('Failed to create workflow from template')
      console.error('Error creating workflow from template:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-lg p-3 ${template.color}`}>
                <template.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-current text-yellow-400" />
                <span className="text-sm font-medium text-gray-700">
                  {template.rating}
                </span>
              </div>
            </div>

            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {template.name}
            </h3>
            <p className="mb-4 line-clamp-3 text-sm text-gray-600">
              {template.description}
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              {template.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{template.estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{template.usageCount}</span>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getDifficultyColor(template.difficulty)}`}
              >
                {template.difficulty}
              </span>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleUseTemplate(template)}
              >
                <Download className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
            <Search className="h-12 w-12" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No templates found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  )
}
