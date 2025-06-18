
import { Tables } from '@/integrations/supabase/types';

// Job Status Types
export type JobStatus = 'quoted' | 'approved' | 'scheduled' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

// Lead Status Types  
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'converted';

// Lead Source Types
export type LeadSource = 'website' | 'referral' | 'google_ads' | 'facebook' | 'direct_mail' | 'cold_call' | 'trade_show' | 'other';

// Task Status Types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Task Priority Types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Invoice Status Types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// Estimate Status Types
export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

// Type helpers for forms
export type JobInsert = Omit<Tables<'jobs'>, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
export type CustomerInsert = Omit<Tables<'customers'>, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
export type LeadInsert = Omit<Tables<'leads'>, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
export type TaskInsert = Omit<Tables<'tasks'>, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

// Status color mappings
export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  quoted: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  on_hold: 'bg-gray-100 text-gray-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800'
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  won: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-red-100 text-red-800',
  converted: 'bg-purple-100 text-purple-800'
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};
