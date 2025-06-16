
import { z } from 'zod';

export const estimateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  estimate_number: z.string().min(1, 'Estimate number is required'),
  customer_id: z.string().optional(),
  job_id: z.string().optional(),
  valid_until: z.string().optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected', 'expired']),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export type EstimateFormData = z.infer<typeof estimateSchema>;

export const invoiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  customer_id: z.string().optional(),
  job_id: z.string().optional(),
  estimate_id: z.string().optional(),
  due_date: z.string().optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
