import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { ApiError } from '@/types/app-types';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number');
export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long');
export const descriptionSchema = z.string().max(1000, 'Description too long');
export const amountSchema = z.number().min(0, 'Amount must be positive');

// User input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

// Rate limiting for client-side (basic implementation)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  checkLimit(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => now - time < windowMs);

    if (validAttempts.length >= maxAttempts) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// Security validation for form inputs
export const validateFormData = (data: Record<string, unknown>, schema: z.ZodSchema) => {
  try {
    // Sanitize string inputs
    const sanitizedData = Object.entries(data).reduce<Record<string, unknown>>((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = sanitizeInput(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

    return schema.parse(sanitizedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(e => e.message).join(', '));
    }
    throw error;
  }
};

// Security headers check
export const checkSecurityHeaders = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const headers = response.headers;

    return {
      hasCSP: headers.has('content-security-policy'),
      hasHSTS: headers.has('strict-transport-security'),
      hasXFrameOptions: headers.has('x-frame-options'),
      hasXContentTypeOptions: headers.has('x-content-type-options'),
      hasReferrerPolicy: headers.has('referrer-policy')
    };
  } catch (error: unknown) {
    // Security headers check handled - functionality preserved
    return null;
  }
};

// RLS Policy Enforcement

/**
 * Error class for authentication and permission issues
 */
export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

/**
 * Validates that the user is authenticated
 * @returns The current authenticated user or throws SecurityError
 */
export const validateAuthentication = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new SecurityError('Authentication required. Please log in.');
  }

  return user;
};

/**
 * Validates that the user has the required permission
 * @param permission The permission to check (e.g., 'leads:read')
 * @returns True if the user has permission, throws SecurityError otherwise
 */
export const validatePermission = async (permission: string): Promise<boolean> => {
  try {
    const user = await validateAuthentication();

    // ADMIN BYPASS: Check if the user's email is the admin email
    // This bypasses the database permission check completely for admin
    if (user.email === 'nayib@finalroofingcompany.com') {
      return true;
    }

    // Call the has_permission RPC function to check if the user has the required permission
    const { data, error } = await supabase.rpc('has_permission', {
      user_id: user.id,
      permission_name: permission
    });

    if (error) {
      // Log error but don't expose details to client
      throw new SecurityError('Permission check failed. Please try again later.');
    }

    if (!data) {
      throw new SecurityError(`You don't have permission to ${permission.replace(':', ' ')}.`);
    }

    return data;
  } catch (error) {
    // FINAL FALLBACK: If any error occurs during permission check,
    // try to get the user directly and check if they're admin
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === 'nayib@finalroofingcompany.com') {
        return true;
      }
    } catch {
      // Ignore nested error
    }

    // Re-throw the original error if not admin
    if (error instanceof SecurityError) {
      throw error;
    }
    throw new SecurityError(`Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Enforces a policy check before executing a database operation
 * @param permission The permission required (e.g., 'leads:read')
 * @param operation The database operation to execute if permission check passes
 * @returns The result of the operation
 */
export async function enforcePolicy<T>(
  permission: string,
  operation: () => Promise<T>
): Promise<T> {
  await validatePermission(permission);
  return operation();
}

/**
 * Utility to check if an error is a Supabase API error
 */
export const isSupabaseError = (error: unknown): error is ApiError => {
  return typeof error === 'object' &&
         error !== null &&
         'error' in error &&
         typeof (error as ApiError).error === 'object';
};

/**
 * Utility to handle Supabase errors consistently
 */
export const handleSupabaseError = (error: unknown): Error => {
  if (isSupabaseError(error)) {
    return new Error(error.error.message);
  } else if (error instanceof Error) {
    return error;
  }
  return new Error('An unexpected error occurred');
};
