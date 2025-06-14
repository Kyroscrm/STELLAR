
import * as z from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number');
export const requiredStringSchema = z.string().min(1, 'This field is required');
export const optionalStringSchema = z.string().optional();

// Customer validation schema
export const customerSchema = z.object({
  first_name: requiredStringSchema,
  last_name: requiredStringSchema,
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema.optional().or(z.literal('')),
  company_name: optionalStringSchema,
  address: optionalStringSchema,
  city: optionalStringSchema,
  state: optionalStringSchema,
  zip_code: z.string().optional(),
  notes: optionalStringSchema,
  emergency_contact_name: optionalStringSchema,
  emergency_contact_phone: phoneSchema.optional().or(z.literal(''))
});

// Lead validation schema
export const leadSchema = z.object({
  first_name: requiredStringSchema,
  last_name: requiredStringSchema,
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema.optional().or(z.literal('')),
  address: optionalStringSchema,
  city: optionalStringSchema,
  state: optionalStringSchema,
  zip_code: optionalStringSchema,
  source: z.enum(['website', 'referral', 'social_media', 'advertising', 'cold_call', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']),
  notes: optionalStringSchema,
  estimated_value: z.number().positive().optional(),
  expected_close_date: z.string().optional()
});

// Job validation schema
export const jobSchema = z.object({
  title: requiredStringSchema,
  description: optionalStringSchema,
  customer_id: requiredStringSchema.uuid('Please select a customer'),
  status: z.enum(['quoted', 'scheduled', 'in_progress', 'completed', 'cancelled']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  address: optionalStringSchema,
  budget: z.number().positive().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional(),
  total_cost: z.number().positive().optional(),
  notes: optionalStringSchema
});

// Task validation schema
export const taskSchema = z.object({
  title: requiredStringSchema,
  description: optionalStringSchema,
  job_id: optionalStringSchema,
  assigned_to: optionalStringSchema,
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional()
});

// Estimate validation schema
export const estimateSchema = z.object({
  title: requiredStringSchema,
  description: optionalStringSchema,
  estimate_number: requiredStringSchema,
  customer_id: optionalStringSchema,
  job_id: optionalStringSchema,
  valid_until: z.string().optional(),
  tax_rate: z.number().min(0).max(1).default(0),
  status: z.enum(['draft', 'sent', 'approved', 'rejected', 'expired']).default('draft'),
  notes: optionalStringSchema,
  terms: optionalStringSchema
});

// Invoice validation schema
export const invoiceSchema = z.object({
  title: requiredStringSchema,
  description: optionalStringSchema,
  invoice_number: requiredStringSchema,
  customer_id: optionalStringSchema,
  job_id: optionalStringSchema,
  estimate_id: optionalStringSchema,
  due_date: z.string().optional(),
  tax_rate: z.number().min(0).max(1).default(0),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  payment_terms: optionalStringSchema,
  notes: optionalStringSchema
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type LeadFormData = z.infer<typeof leadSchema>;
export type JobFormData = z.infer<typeof jobSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type EstimateFormData = z.infer<typeof estimateSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
