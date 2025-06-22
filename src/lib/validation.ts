
import { z } from 'zod';

// Customer validation schema
export const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  notes: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

// Lead validation schema
export const leadSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['website', 'referral', 'social_media', 'advertising', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'converted']),
  estimated_value: z.number().optional(),
  expected_close_date: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
});

// Estimate validation schema
export const estimateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  estimate_number: z.string().min(1, 'Estimate number is required'),
  customer_id: z.string().optional(),
  job_id: z.string().optional(),
  valid_until: z.string().optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected', 'expired']).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

// Job validation schema
export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  customer_id: z.string().optional(),
  status: z.enum(['quoted', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  estimated_hours: z.number().optional(),
  actual_hours: z.number().optional(),
  budget: z.number().optional(),
  total_cost: z.number().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

// Invoice validation schema - Updated payment_status to use proper enum
export const invoiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  customer_id: z.string().optional(),
  job_id: z.string().optional(),
  estimate_id: z.string().optional(),
  due_date: z.string().optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  payment_status: z.enum(['completed', 'failed', 'pending', 'refunded']).optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
});

// Task validation schema
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  job_id: z.string().optional(),
  assigned_to: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().optional(),
  actual_hours: z.number().optional(),
});

// Export types for form data
export type CustomerFormData = z.infer<typeof customerSchema>;
export type LeadFormData = z.infer<typeof leadSchema>;
export type EstimateFormData = z.infer<typeof estimateSchema>;
export type JobFormData = z.infer<typeof jobSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
