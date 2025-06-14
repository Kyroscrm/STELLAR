
import { supabase } from '@/integrations/supabase/client';
import { customerSchema, leadSchema, jobSchema, taskSchema, estimateSchema, invoiceSchema } from './validation';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Server-side validation helper
export const validateOnServer = async (
  schema: any,
  data: any,
  additionalChecks?: (data: any) => Promise<Record<string, string>>
): Promise<ValidationResult> => {
  const errors: Record<string, string> = {};

  // Zod validation
  try {
    schema.parse(data);
  } catch (error: any) {
    if (error.errors) {
      error.errors.forEach((err: any) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
    }
  }

  // Additional server-side checks
  if (additionalChecks) {
    const serverErrors = await additionalChecks(data);
    Object.assign(errors, serverErrors);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Customer-specific server validation
export const validateCustomer = async (data: any): Promise<ValidationResult> => {
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
export const validateLead = async (data: any): Promise<ValidationResult> => {
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
export const validateJob = async (data: any): Promise<ValidationResult> => {
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

// Estimate-specific server validation
export const validateEstimate = async (data: any): Promise<ValidationResult> => {
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
export const validateInvoice = async (data: any): Promise<ValidationResult> => {
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
