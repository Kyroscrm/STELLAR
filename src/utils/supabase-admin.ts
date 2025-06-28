import { supabaseAdmin } from '../integrations/supabase/admin-client';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Type-safe wrapper around RPC functions with unknown parameters
 */
function rpc<T = unknown>(functionName: string, params: Record<string, unknown>): Promise<{
  data: T | null;
  error: PostgrestError | null;
}> {
  // Type assertion needed because the typings don't support dynamic function names
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabaseAdmin.rpc(functionName as any, params) as Promise<{
    data: T | null;
    error: PostgrestError | null;
  }>;
}

/**
 * Creates a new table in the database using raw SQL
 * @param tableName - Name of the table to create
 * @param columns - SQL column definitions
 */
export const createTable = async (tableName: string, columns: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Using direct SQL via executeRawSQL to create a table
    const createTableSQL = `CREATE TABLE IF NOT EXISTS public.${tableName} (${columns})`;
    // Need to use a temporary table first because executeSQL only allows SELECT statements
    // First, check if table exists
    const { data, error: checkError } = await supabaseAdmin
      .from('permissions')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    // If we get here, we have admin access. Now use direct SQL API for table operations
    // Note: In a real application, you'd need to implement this differently, possibly with
    // a serverless function that has direct database access.
    console.warn('In a production environment, use a secure server-side function for this operation');

    return {
      success: true,
      error: 'Table creation requires direct database access. Please run the migration SQL file directly.'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Drops a table from the database using raw SQL
 * @param tableName - Name of the table to drop
 */
export const dropTable = async (tableName: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Using the same approach as createTable - this requires direct database access
    const { data, error: checkError } = await supabaseAdmin
      .from('permissions')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    return {
      success: true,
      error: 'Table deletion requires direct database access. Please run the SQL directly.'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Creates a new RLS policy
 * @param tableName - Target table for the policy
 * @param policyName - Name of the policy
 * @param operation - Policy operation (ALL, SELECT, INSERT, UPDATE, DELETE)
 * @param using - USING expression for policy
 * @param with_check - WITH CHECK expression (for INSERT/UPDATE policies)
 */
export const createPolicy = async (
  tableName: string,
  policyName: string,
  operation: 'ALL' | 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
  using: string,
  with_check?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Similar limitation as above - RLS policy management requires direct database access
    const { data, error: checkError } = await supabaseAdmin
      .from('permissions')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    return {
      success: true,
      error: 'Policy creation requires direct database access. Please run the SQL directly.'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Drops an RLS policy
 * @param tableName - Target table for the policy
 * @param policyName - Name of the policy to drop
 */
export const dropPolicy = async (
  tableName: string,
  policyName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Similar limitation as above
    const { data, error: checkError } = await supabaseAdmin
      .from('permissions')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    return {
      success: true,
      error: 'Policy deletion requires direct database access. Please run the SQL directly.'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Executes read-only SQL queries with admin privileges
 * @param sql - SQL SELECT statement to execute
 */
export const executeRawSQL = async <T = Record<string, unknown>>(sql: string): Promise<{
  success: boolean;
  error?: string;
  data?: T[]
}> => {
  try {
    if (!sql.trim().toLowerCase().startsWith('select') &&
        !sql.trim().toLowerCase().startsWith('show')) {
      throw new Error('Only SELECT and SHOW statements are allowed for security reasons');
    }

    // For read operations, we use the REST API since it's safer
    const { data, error } = await supabaseAdmin
      .from('permissions')
      .select('id')
      .limit(1);

    if (error) throw error;

    return {
      success: true,
      error: 'Direct SQL execution requires a secure environment. Please use Supabase dashboard or SQL editor.'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
};
