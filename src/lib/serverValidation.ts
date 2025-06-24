
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { customerSchema, leadSchema, jobSchema, taskSchema, estimateSchema, invoiceSchema } from './validation';
import { ValidationResult } from '../types/app-types';

// Server-side validation helper
export const validateOnServer = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  additionalChecks?: (data: T) => Promise<Record<string, string>>
): Promise<ValidationResult> => {
  const errors: Record<string, string> = {};

  // Zod validation
  try {
    const parsed = schema.parse(data);

    // Additional server-side checks
    if (additionalChecks) {
      const serverErrors = await additionalChecks(parsed);
      Object.assign(errors, serverErrors);
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
    } else {
      errors.general = 'Validation failed';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Customer-specific server validation
export const validateCustomer = async (data: unknown): Promise<ValidationResult> => {
  return validateOnServer(customerSchema, data, async (customerData) => {
    const errors: Record<string, string> = {};

    // Check for duplicate email
    if (customerData.email) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customerData.email)
        .single();

      if (existingCustomer) {
        errors.email = 'A customer with this email already exists';
      }
    }

    // Check for duplicate phone
    if (customerData.phone) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customerData.phone)
        .single();

      if (existingCustomer) {
        errors.phone = 'A customer with this phone number already exists';
      }
    }

    return errors;
  });
};

// Lead-specific server validation
export const validateLead = async (data: unknown): Promise<ValidationResult> => {
  return validateOnServer(leadSchema, data, async (leadData) => {
    const errors: Record<string, string> = {};

    // Check for duplicate email
    if (leadData.email) {
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', leadData.email)
        .single();

      if (existingLead) {
        errors.email = 'A lead with this email already exists';
      }
    }

    // Validate expected_close_date is in the future
    if (leadData.expected_close_date) {
      const closeDate = new Date(leadData.expected_close_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (closeDate < today) {
        errors.expected_close_date = 'Expected close date must be in the future';
      }
    }

    return errors;
  });
};

// Job-specific server validation
export const validateJob = async (data: unknown): Promise<ValidationResult> => {
  return validateOnServer(jobSchema, data, async (jobData) => {
    const errors: Record<string, string> = {};

    // Validate customer exists
    if (jobData.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('id', jobData.customer_id)
        .single();

      if (!customer) {
        errors.customer_id = 'Selected customer does not exist';
      }
    }

    // Validate date ranges
    if (jobData.start_date && jobData.end_date) {
      const startDate = new Date(jobData.start_date);
      const endDate = new Date(jobData.end_date);

      if (endDate < startDate) {
        errors.end_date = 'End date must be after start date';
      }
    }

    // Validate actual hours vs estimated hours
    if (jobData.actual_hours && jobData.estimated_hours) {
      if (jobData.actual_hours > jobData.estimated_hours * 2) {
        errors.actual_hours = 'Actual hours significantly exceed estimated hours. Please review.';
      }
    }

    return errors;
  });
};

// Task-specific server validation
export const validateTask = async (data: unknown): Promise<ValidationResult> => {
  return validateOnServer(taskSchema, data, async (taskData) => {
    const errors: Record<string, string> = {};

    // Validate job exists if job_id provided
    if (taskData.job_id) {
      const { data: job } = await supabase
        .from('jobs')
        .select('id')
        .eq('id', taskData.job_id)
        .single();

      if (!job) {
        errors.job_id = 'Selected job does not exist';
      }
    }

    // Validate assigned user exists if assigned_to provided
    if (taskData.assigned_to) {
      // Note: In a real app, you'd validate against a users table
      // For now, just check it's a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(taskData.assigned_to)) {
        errors.assigned_to = 'Invalid user assignment';
      }
    }

    // Validate due date is not in the past
    if (taskData.due_date) {
      const dueDate = new Date(taskData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        errors.due_date = 'Due date cannot be in the past';
      }
    }

    return errors;
  });
};

// Estimate-specific server validation
export const validateEstimate = async (data: unknown): Promise<ValidationResult> => {
  return validateOnServer(estimateSchema, data, async (estimateData) => {
    const errors: Record<string, string> = {};

    // Check for duplicate estimate number
    if (estimateData.estimate_number) {
      const { data: existingEstimate } = await supabase
        .from('estimates')
        .select('id')
        .eq('estimate_number', estimateData.estimate_number)
        .single();

      if (existingEstimate) {
        errors.estimate_number = 'An estimate with this number already exists';
      }
    }

    // Validate customer exists
    if (estimateData.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('id', estimateData.customer_id)
        .single();

      if (!customer) {
        errors.customer_id = 'Selected customer does not exist';
      }
    }

    // Validate valid_until is in the future
    if (estimateData.valid_until) {
      const validDate = new Date(estimateData.valid_until);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (validDate < today) {
        errors.valid_until = 'Valid until date must be in the future';
      }
    }

    return errors;
  });
};

// Invoice-specific server validation
export const validateInvoice = async (data: unknown): Promise<ValidationResult> => {
  return validateOnServer(invoiceSchema, data, async (invoiceData) => {
    const errors: Record<string, string> = {};

    // Check for duplicate invoice number
    if (invoiceData.invoice_number) {
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_number', invoiceData.invoice_number)
        .single();

      if (existingInvoice) {
        errors.invoice_number = 'An invoice with this number already exists';
      }
    }

    // Validate customer exists
    if (invoiceData.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('id', invoiceData.customer_id)
        .single();

      if (!customer) {
        errors.customer_id = 'Selected customer does not exist';
      }
    }

    // Validate due date is in the future
    if (invoiceData.due_date) {
      const dueDate = new Date(invoiceData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        errors.due_date = 'Due date should be in the future';
      }
    }

    return errors;
  });
};
