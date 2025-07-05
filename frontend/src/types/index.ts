// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

// User Types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  is_premium: boolean
  api_rate_limit: number
  preferences: Record<string, any>
  subscription_tier: string
  bio?: string
  avatar?: string
  phone_number?: string
  timezone?: string
  language?: string
  created_at: string
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
}

export interface AuthResponse {
  message: string
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

// Workflow Types
export interface Workflow {
  id: string
  name: string
  description: string
  configuration: Record<string, any>
  status: 'draft' | 'active' | 'paused' | 'archived'
  is_active: boolean
  trigger_type: 'manual' | 'scheduled' | 'webhook' | 'api' | 'event'
  trigger_config: Record<string, any>
  version: number
  node_count: number
  created_at: string
  updated_at: string
}

export interface WorkflowNode {
  id: string
  workflow_id: string
  parent_node_id?: string
  node_type:
    | 'trigger'
    | 'action'
    | 'condition'
    | 'loop'
    | 'parallel'
    | 'merge'
    | 'ai_chat'
    | 'ai_completion'
    | 'api_call'
    | 'webhook'
    | 'email'
    | 'sms'
    | 'notification'
    | 'data_transform'
    | 'file_process'
    | 'database'
    | 'custom'
  name: string
  configuration: Record<string, any>
  input_schema: Record<string, any>
  output_schema: Record<string, any>
  position_x: number
  position_y: number
  created_at: string
  updated_at: string
}

// Execution Types
export interface WorkflowExecution {
  id: string
  workflow: {
    id: string
    name: string
  }
  status:
    | 'pending'
    | 'running'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'timeout'
  input_data: Record<string, any>
  output_data: Record<string, any>
  started_at: string
  completed_at?: string
  error_message?: string
  trigger_source: 'manual' | 'scheduled' | 'webhook' | 'api' | 'event'
  execution_context: Record<string, any>
  duration?: string
}

export interface NodeExecution {
  id: string
  workflow_execution_id: string
  node: {
    id: string
    name: string
    node_type: string
  }
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'timeout'
  input_data: Record<string, any>
  output_data: Record<string, any>
  started_at: string
  completed_at?: string
  error_message?: string
  retry_count: number
  execution_logs: Array<{
    timestamp: string
    level: string
    message: string
    data?: Record<string, any>
  }>
}

// Integration Types
export interface Integration {
  id: string
  service_name: string
  service_type:
    | 'ai'
    | 'api'
    | 'webhook'
    | 'oauth'
    | 'database'
    | 'email'
    | 'sms'
    | 'notification'
    | 'file_storage'
    | 'analytics'
    | 'other'
  display_name: string
  description: string
  configuration: Record<string, any>
  is_active: boolean
  is_verified: boolean
  last_used?: string
  usage_count: number
  created_at: string
  updated_at: string
  expires_at?: string
}

// Template Types
export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category:
    | 'ai'
    | 'data'
    | 'automation'
    | 'integration'
    | 'notification'
    | 'utility'
    | 'custom'
  workflow_config: Record<string, any>
  node_configs: WorkflowNode[]
  is_public: boolean
  usage_count: number
  created_at: string
}

// UI State Types
export interface AppState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// Form Types
export interface FormField {
  name: string
  label: string
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'select'
    | 'textarea'
    | 'checkbox'
    | 'radio'
  placeholder?: string
  required?: boolean
  options?: Array<{ label: string; value: string | number }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// API Client Types
export interface ApiClient {
  get<T = any>(url: string, config?: any): Promise<T>
  post<T = any>(url: string, data?: any, config?: any): Promise<T>
  put<T = any>(url: string, data?: any, config?: any): Promise<T>
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>
  delete<T = any>(url: string, config?: any): Promise<T>
}

// Error Types
export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

// Pagination Types
export interface PaginatedResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

// Filter and Sort Types
export interface ListFilters {
  search?: string
  status?: string
  type?: string
  category?: string
  created_after?: string
  created_before?: string
  ordering?: string
  page?: number
  page_size?: number
}
