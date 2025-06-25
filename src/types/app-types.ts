import { Database } from '../integrations/supabase/types';

// Database table types from Supabase
export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export type Lead = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export type Job = Database['public']['Tables']['jobs']['Row'];
export type JobInsert = Database['public']['Tables']['jobs']['Insert'];
export type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type Estimate = Database['public']['Tables']['estimates']['Row'];
export type EstimateInsert = Database['public']['Tables']['estimates']['Insert'];
export type EstimateUpdate = Database['public']['Tables']['estimates']['Update'];

export type EstimateLineItem = Database['public']['Tables']['estimate_line_items']['Row'];
export type EstimateLineItemInsert = Database['public']['Tables']['estimate_line_items']['Insert'];
export type EstimateLineItemUpdate = Database['public']['Tables']['estimate_line_items']['Update'];

export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];

export type InvoiceLineItem = Database['public']['Tables']['invoice_line_items']['Row'];
export type InvoiceLineItemInsert = Database['public']['Tables']['invoice_line_items']['Insert'];
export type InvoiceLineItemUpdate = Database['public']['Tables']['invoice_line_items']['Update'];

export type EstimateTemplate = Database['public']['Tables']['estimate_templates']['Row'];
export type EstimateTemplateInsert = Database['public']['Tables']['estimate_templates']['Insert'];
export type EstimateTemplateUpdate = Database['public']['Tables']['estimate_templates']['Update'];

export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];
export type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert'];

export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
export type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert'];
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'];

export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];

export type DashboardWidget = Database['public']['Tables']['dashboard_widgets']['Row'];
export type DashboardWidgetInsert = Database['public']['Tables']['dashboard_widgets']['Insert'];
export type DashboardWidgetUpdate = Database['public']['Tables']['dashboard_widgets']['Update'];

export type FileWorkflow = Database['public']['Tables']['file_workflows']['Row'];
export type WorkflowStep = Database['public']['Tables']['workflow_steps']['Row'];

export type FollowUpReminder = Database['public']['Tables']['follow_up_reminders']['Row'];
export type FollowUpReminderInsert = Database['public']['Tables']['follow_up_reminders']['Insert'];
export type FollowUpReminderUpdate = Database['public']['Tables']['follow_up_reminders']['Update'];

export type EstimateAutomation = Database['public']['Tables']['estimate_automations']['Row'];
export type EstimateAutomationInsert = Database['public']['Tables']['estimate_automations']['Insert'];
export type EstimateAutomationUpdate = Database['public']['Tables']['estimate_automations']['Update'];

export type SavedSearch = Database['public']['Tables']['saved_searches']['Row'];
export type SavedSearchInsert = Database['public']['Tables']['saved_searches']['Insert'];
export type SavedSearchUpdate = Database['public']['Tables']['saved_searches']['Update'];

// Note: security_events table not found in current schema, using custom type
export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Enums from Supabase
export type JobStatus = Database['public']['Enums']['job_status'];
export type TaskStatus = Database['public']['Enums']['task_status'];
export type TaskPriority = Database['public']['Enums']['task_priority'];
export type LeadStatus = Database['public']['Enums']['lead_status'];
export type LeadSource = Database['public']['Enums']['lead_source'];
export type EstimateStatus = Database['public']['Enums']['estimate_status'];
export type InvoiceStatus = Database['public']['Enums']['invoice_status'];

// Custom types for form data and component props
export interface FormFieldError {
  message: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface LineItemFormData {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
  sort_order?: number;
}

export interface EstimateFormData {
  title: string;
  customer_id: string;
  description?: string;
  notes?: string;
  terms?: string;
  tax_rate?: number;
  valid_until?: string;
  line_items: LineItemFormData[];
}

export interface InvoiceFormData {
  title: string;
  description?: string;
  invoice_number: string;
  customer_id?: string;
  job_id?: string;
  estimate_id?: string;
  due_date?: string;
  tax_rate?: number;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'viewed';
  payment_status?: 'completed' | 'failed' | 'pending' | 'refunded';
  payment_terms?: string;
  notes?: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total?: number;
    sort_order?: number;
  }>;
}

export interface CustomerFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface LeadFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  project_description?: string;
  budget_range?: string;
  timeline?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
}

export interface JobFormData {
  customer_id: string;
  title: string;
  description?: string;
  status: JobStatus;
  start_date?: string;
  end_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  job_id?: string;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  priority: TaskPriority;
  status: TaskStatus;
}

// Component prop types
export interface SearchResult {
  id: string;
  title: string;
  type: 'customer' | 'lead' | 'job' | 'estimate' | 'invoice' | 'task';
  subtitle?: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardStatsData {
  customers: Customer[];
  leads: Lead[];
  jobs: Job[];
  estimates: Estimate[];
  invoices: Invoice[];
  tasks: Task[];
}

export interface ConversionMetricsData {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  avgConversionTime: number;
  revenueFromConversions: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

// ActivityLog already has metadata as Json type, so we just use the base type
export type ActivityLogWithDetails = ActivityLog;

// Hook return types
export interface UseOptimisticUpdateResult<T> {
  optimisticData: T[] | null;
  executeOptimistic: (operation: () => Promise<void>, optimisticUpdate: T[]) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseDataValidationResult {
  validate: (schema: unknown, value: unknown, additionalChecks?: (data: unknown) => Promise<Record<string, string>>) => Promise<ValidationResult>;
  isValidating: boolean;
  error: Error | null;
}

// Error handling types
export interface AppError extends Error {
  code?: string;
  trace_id?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: Record<string, unknown> | null;
}

// Workflow and automation types
export interface WorkflowStepConfig {
  type: string;
  settings: Record<string, unknown>;
  conditions?: Record<string, unknown>;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number | boolean;
}

export interface AutomationAction {
  type: 'email' | 'notification' | 'status_change' | 'assignment';
  config: Record<string, unknown>;
}

// Template types
export interface EstimateTemplateLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
}

export interface EstimateTemplateFormData {
  name: string;
  description?: string;
  line_items: EstimateTemplateLineItem[];
  tax_rate: number;
  notes?: string;
  terms?: string;
}

// Filter and search types
export interface FilterOptions {
  status?: string[];
  priority?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  assigned_to?: string[];
  customer_id?: string;
  job_id?: string;
}

export interface SavedSearchData {
  name: string;
  filters: FilterOptions;
  entity_type: string;
}

// Utility types
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API response types
export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
    trace_id?: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Form submission handlers
export type FormSubmitHandler<T> = (data: T) => Promise<void> | void;

// Generic CRUD operation types
export interface CrudOperations<T, TInsert = Partial<T>, TUpdate = Partial<T>> {
  create: (data: TInsert) => Promise<T>;
  read: (id: string) => Promise<T | null>;
  update: (id: string, data: TUpdate) => Promise<T>;
  delete: (id: string) => Promise<void>;
  list: (filters?: FilterOptions) => Promise<T[]>;
}

export interface InvoiceWithRelations extends Invoice {
  invoice_line_items: InvoiceLineItem[];
  customers?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
}

export interface InvoiceLineItemData {
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
  sort_order?: number;
}

export interface LogoSettings {
  logo_url: string | null;
  logo_width: number;
  logo_height: number;
  logo_position: 'top-center' | 'watermark' | 'both';
  watermark_opacity: number;
  show_on_drafts: boolean;
  show_on_approved: boolean;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

export interface BaseDocument {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  notes?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  customer_id: string;
  job_id: string;
  customer?: Customer;
}

export interface Estimate extends BaseDocument {
  estimate_number: string;
  valid_until?: string;
  status: 'draft' | 'approved' | 'sent' | 'viewed' | 'rejected' | 'expired';
  terms?: string;
  line_items: LineItem[];
}

export interface Invoice extends BaseDocument {
  invoice_number: string;
  due_date?: string;
  payment_terms?: string;
  line_items: LineItem[];
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}
