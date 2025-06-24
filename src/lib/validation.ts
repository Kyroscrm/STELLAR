import { z } from 'zod';

// Enhanced validation patterns
const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
const zipCodeRegex = /^\d{5}(-\d{4})?$/;

// Customer validation schema - Enhanced
export const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val.replace(/[\s\-()]/g, '')), {
      message: 'Please enter a valid phone number'
    }),
  company_name: z.string().max(100, 'Company name must be less than 100 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(50, 'City must be less than 50 characters').optional(),
  state: z.string().max(30, 'State must be less than 30 characters').optional(),
  zip_code: z.string()
    .optional()
    .refine((val) => !val || zipCodeRegex.test(val), {
      message: 'Please enter a valid ZIP code (12345 or 12345-6789)'
    }),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  emergency_contact_name: z.string().max(100, 'Emergency contact name must be less than 100 characters').optional(),
  emergency_contact_phone: z.string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val.replace(/[\s\-()]/g, '')), {
      message: 'Please enter a valid emergency contact phone number'
    }),
});

// Lead validation schema - Enhanced
export const leadSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val.replace(/[\s\-()]/g, '')), {
      message: 'Please enter a valid phone number'
    }),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(50, 'City must be less than 50 characters').optional(),
  state: z.string().max(30, 'State must be less than 30 characters').optional(),
  zip_code: z.string()
    .optional()
    .refine((val) => !val || zipCodeRegex.test(val), {
      message: 'Please enter a valid ZIP code (12345 or 12345-6789)'
    }),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  source: z.enum(['website', 'referral', 'social_media', 'advertising', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'converted']),
  estimated_value: z.number().min(0, 'Estimated value must be positive').optional(),
  expected_close_date: z.string().optional(),
  score: z.number().min(0, 'Score must be at least 0').max(100, 'Score must be at most 100').optional(),
});

// Estimate validation schema - Enhanced
export const estimateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  estimate_number: z.string().min(1, 'Estimate number is required').max(50, 'Estimate number must be less than 50 characters'),
  customer_id: z.string().uuid('Invalid customer ID').optional(),
  job_id: z.string().uuid('Invalid job ID').optional(),
  valid_until: z.string().optional(),
  tax_rate: z.number().min(0, 'Tax rate must be non-negative').max(1, 'Tax rate must be less than or equal to 100%').optional(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected', 'expired']).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  terms: z.string().max(2000, 'Terms must be less than 2000 characters').optional(),
});

// Job validation schema - Enhanced
export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  customer_id: z.string().uuid('Invalid customer ID').optional(),
  status: z.enum(['quoted', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  estimated_hours: z.number().min(0, 'Estimated hours must be non-negative').optional(),
  actual_hours: z.number().min(0, 'Actual hours must be non-negative').optional(),
  budget: z.number().min(0, 'Budget must be non-negative').optional(),
  total_cost: z.number().min(0, 'Total cost must be non-negative').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

// Invoice validation schema - Enhanced with proper payment_status enum
export const invoiceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  invoice_number: z.string().min(1, 'Invoice number is required').max(50, 'Invoice number must be less than 50 characters'),
  customer_id: z.string().uuid('Invalid customer ID').optional(),
  job_id: z.string().uuid('Invalid job ID').optional(),
  estimate_id: z.string().uuid('Invalid estimate ID').optional(),
  due_date: z.string().optional(),
  tax_rate: z.number().min(0, 'Tax rate must be non-negative').max(1, 'Tax rate must be less than or equal to 100%').optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled', 'viewed']).optional(),
  payment_status: z.enum(['completed', 'failed', 'pending', 'refunded']).optional(),
  payment_terms: z.string().max(500, 'Payment terms must be less than 500 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  line_items: z.array(z.object({
    description: z.string().min(1, 'Description is required').max(200, 'Description must be less than 200 characters'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unit_price: z.number().min(0, 'Unit price must be non-negative'),
    total: z.number().min(0, 'Total must be non-negative').optional(),
    sort_order: z.number().optional()
  })).optional()
});

// Task validation schema - Enhanced
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  job_id: z.string().uuid('Invalid job ID').optional(),
  assigned_to: z.string().uuid('Invalid assignee ID').optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().min(0, 'Estimated hours must be non-negative').optional(),
  actual_hours: z.number().min(0, 'Actual hours must be non-negative').optional(),
});

// Line item validation schema for estimates and invoices
export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description must be less than 200 characters'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  total: z.number().min(0, 'Total must be non-negative').optional(),
});

// Export types for form data
export type CustomerFormData = z.infer<typeof customerSchema>;
export type LeadFormData = z.infer<typeof leadSchema>;
export type EstimateFormData = z.infer<typeof estimateSchema>;
export type JobFormData = z.infer<typeof jobSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type LineItemFormData = z.infer<typeof lineItemSchema>;
