import { useCallback } from 'react'
import { useErrorHandler } from './useErrorHandler'
import { supabase } from '../integrations/supabase/client'

export interface RetentionPolicy {
  id: string
  table_name: string
  retention_days: number
  created_at: string
  updated_at: string
}

export interface RetentionReport {
  records_cleaned: number
  tables_affected: string[]
  execution_time: string
}

export interface UpdateRetentionPolicyInput {
  retention_days: number
}

export interface UseDataRetentionResult {
  createPolicy: (tableName: string, retentionDays: number) => Promise<RetentionPolicy | null>
  updatePolicy: (id: string, input: UpdateRetentionPolicyInput) => Promise<RetentionPolicy | null>
  deletePolicy: (id: string) => Promise<boolean>
  executeCleanup: () => Promise<RetentionReport | null>
  getPolicies: () => Promise<RetentionPolicy[]>
}

export function useDataRetention(): UseDataRetentionResult {
  const { handleError, handleSuccess } = useErrorHandler()

  const createPolicy = useCallback(async (tableName: string, retentionDays: number) => {
    try {
      const { data, error } = await supabase
        .from('retention_policies')
        .insert({
          table_name: tableName,
          retention_days: retentionDays,
        })
        .select()
        .single()

      if (error) throw error

      handleSuccess({
        description: `Retention policy created for ${tableName}`
      })
      return data as RetentionPolicy
    } catch (error) {
      handleError(error, {
        description: 'Failed to create retention policy'
      })
      return null
    }
  }, [handleError, handleSuccess])

  const updatePolicy = useCallback(async (id: string, input: UpdateRetentionPolicyInput) => {
    try {
      const { data, error } = await supabase
        .from('retention_policies')
        .update({ retention_days: input.retention_days })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      handleSuccess({
        description: 'Retention policy updated successfully'
      })
      return data as RetentionPolicy
    } catch (error) {
      handleError(error, {
        description: 'Failed to update retention policy'
      })
      return null
    }
  }, [handleError, handleSuccess])

  const deletePolicy = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('retention_policies')
        .delete()
        .eq('id', id)

      if (error) throw error

      handleSuccess({
        description: 'Retention policy deleted successfully'
      })
      return true
    } catch (error) {
      handleError(error, {
        description: 'Failed to delete retention policy'
      })
      return false
    }
  }, [handleError, handleSuccess])

  const executeCleanup = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('execute_retention_cleanup')

      if (error) throw error

      handleSuccess({
        description: 'Data cleanup completed successfully'
      })
      return data as RetentionReport
    } catch (error) {
      handleError(error, {
        description: 'Failed to execute data cleanup'
      })
      return null
    }
  }, [handleError, handleSuccess])

  const getPolicies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('retention_policies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data as RetentionPolicy[]
    } catch (error) {
      handleError(error, {
        description: 'Failed to fetch retention policies'
      })
      return []
    }
  }, [handleError])

  return {
    createPolicy,
    updatePolicy,
    deletePolicy,
    executeCleanup,
    getPolicies,
  }
}
