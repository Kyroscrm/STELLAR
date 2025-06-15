
import { z } from 'zod';

export const estimateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  estimate_number: z.string().min(1, 'Estimate number is required'),
  customer_id: z.string().optional(),
  job_id: z.string().optional(),
  valid_until: z.string().optional(),
  tax_rate: z.number().min(0).max(1).default(0),
  status: z.enum(['draft', 'sent', 'approved', 'rejected', 'expired']).default('draft'),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export type EstimateFormData = z.infer<typeof estimateSchema>;

export const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
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

export type CustomerFormData = z.infer<typeof customerSchema>;

export const leadSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  source: z.enum(['website', 'referral', 'social_media', 'google_ads', 'other']).default('website'),
  status: z.enum(['new', 'contacted', 'qualified', 'won', 'lost']).default('new'),
  estimated_value: z.number().min(0).optional(),
  expected_close_date: z.string().optional(),
  notes: z.string().optional(),
  score: z.number().min(0).max(100).default(0),
});

export type LeadFormData = z.infer<typeof leadSchema>;

export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  customer_id: z.string().optional(),
  status: z.enum(['quoted', 'scheduled', 'in_progress', 'completed', 'cancelled']).default('quoted'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.number().min(0).optional(),
  estimated_hours: z.number().min(0).optional(),
  actual_hours: z.number().min(0).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  total_cost: z.number().min(0).optional(),
});

export type JobFormData = z.infer<typeof jobSchema>;

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  job_id: z.string().optional(),
  assigned_to: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().optional(),
  estimated_hours: z.number().min(0).optional(),
  actual_hours: z.number().min(0).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export const invoiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  customer_id: z.string().optional(),
  job_id: z.string().optional(),
  estimate_id: z.string().optional(),
  due_date: z.string().optional(),
  tax_rate: z.number().min(0).max(1).default(0),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
