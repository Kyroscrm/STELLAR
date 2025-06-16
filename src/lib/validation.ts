
import { z } from 'zod';

// Customer validation schema
export const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  company_name: z.string().optional(),
  notes: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// Lead validation schema
export const leadSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  source: z.enum(['website', 'referral', 'google_ads', 'facebook', 'direct_mail', 'cold_call', 'trade_show', 'other']).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'converted']).optional(),
  score: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  estimated_value: z.number().min(0).optional(),
  expected_close_date: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// Job validation schema
export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  customer_id: z.string().optional(),
  status: z.enum(['quoted', 'approved', 'scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  estimated_hours: z.number().min(0).optional(),
  actual_hours: z.number().min(0).optional(),
  budget: z.number().min(0).optional(),
  total_cost: z.number().min(0).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type JobFormData = z.infer<typeof jobSchema>;

// Task validation schema
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  job_id: z.string().optional(),
  assigned_to: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().min(0).optional(),
  actual_hours: z.number().min(0).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// Estimate validation schema
export const estimateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  estimate_number: z.string().min(1, 'Estimate number is required'),
  customer_id: z.string().optional(),
  job_id: z.string().optional(),
  valid_until: z.string().optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'approved', 'rejected', 'expired']).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export type EstimateFormData = z.infer<typeof estimateSchema>;

// Invoice validation schema
export const invoiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  customer_id: z.string().uuid('Invalid customer ID').optional().or(z.literal('')),
  job_id: z.string().uuid('Invalid job ID').optional().or(z.literal('')),
  estimate_id: z.string().uuid('Invalid estimate ID').optional().or(z.literal('')),
  due_date: z.string().optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled']).optional(),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// Profile validation schema
export const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  company_name: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
