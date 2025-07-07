import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { useRBAC } from './useRBAC';
import { useEnhancedActivityLogs } from './useEnhancedActivityLogs';
import { 
  EstimateStatus, 
  ApiError, 
  EstimateLineItem, 
  EstimateWithLineItems,
  EstimateFormData,
  Estimate,
  EstimateInsert,
  EstimateUpdate,
  Customer
} from '@/types/app-types';
import { enforcePolicy, isSupabaseError, handleSupabaseError } from '@/lib/security';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import type { Database } from '@/types/supabase';

export interface EstimateFilters {
  status?: EstimateStatus[];
  customerId?: string;
  jobId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface UseEstimatesReturn {
  estimates: EstimateWithLineItems[];
  loading: boolean;
  error: Error | null;
  fetchEstimates: (filters?: EstimateFilters) => Promise<void>;
  createEstimate: (data: EstimateFormData) => Promise<void>;
  updateEstimate: (id: string, data: Partial<EstimateFormData>) => Promise<void>;
  deleteEstimate: (id: string) => Promise<void>;
}

export const useEstimates = (): UseEstimatesReturn => {
  const { user } = useAuth();
  const [estimates, setEstimates] = useState<EstimateWithLineItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();
  const { executeUpdate } = useOptimisticUpdate();
  const { logActivity } = useEnhancedActivityLogs();

  const fetchEstimates = async (filters?: EstimateFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('estimates')
        .select(`
          *,
          estimate_line_items (*),
          customers (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('user_id', user?.id);

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }

      if (filters?.jobId) {
        query = query.eq('job_id', filters.jobId);
      }

      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw handleSupabaseError(fetchError);
      }

      setEstimates(data as EstimateWithLineItems[]);
    } catch (err) {
      const error = handleError(err);
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createEstimate = async (data: EstimateFormData) => {
    try {
      setLoading(true);
      setError(null);

      const newEstimate: EstimateInsert = {
        user_id: user?.id,
        customer_id: data.customer_id,
        title: data.title,
        description: data.description,
        notes: data.notes,
        tax_rate: data.tax_rate,
        valid_until: data.valid_until,
        status: 'draft' as EstimateStatus
      };

      const { data: createdEstimate, error: createError } = await supabase
        .from('estimates')
        .insert(newEstimate)
        .select()
        .single();

      if (createError) {
        throw handleSupabaseError(createError);
      }

      if (data.line_items?.length) {
        const lineItems = data.line_items.map((item, index) => ({
          estimate_id: createdEstimate.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          sort_order: index + 1
        }));

        const { error: lineItemError } = await supabase
          .from('estimate_line_items')
          .insert(lineItems);

        if (lineItemError) {
          throw handleSupabaseError(lineItemError);
        }
      }

      await logActivity('create', 'estimate', createdEstimate.id, 'Created new estimate');
      await fetchEstimates();
      toast.success('Estimate created successfully');
    } catch (err) {
      const error = handleError(err);
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateEstimate = async (id: string, data: Partial<EstimateFormData>) => {
    try {
      setLoading(true);
      setError(null);

      const updateData: EstimateUpdate = {
        title: data.title,
        description: data.description,
        notes: data.notes,
        tax_rate: data.tax_rate,
        valid_until: data.valid_until
      };

      const { data: updatedEstimate, error: updateError } = await supabase
        .from('estimates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw handleSupabaseError(updateError);
      }

      if (data.line_items?.length) {
        // Delete existing line items
        const { error: deleteError } = await supabase
          .from('estimate_line_items')
          .delete()
          .eq('estimate_id', id);

        if (deleteError) {
          throw handleSupabaseError(deleteError);
        }

        // Insert new line items
        const lineItems = data.line_items.map((item, index) => ({
          estimate_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          sort_order: index + 1
        }));

        const { error: lineItemError } = await supabase
          .from('estimate_line_items')
          .insert(lineItems);

        if (lineItemError) {
          throw handleSupabaseError(lineItemError);
        }
      }

      await logActivity('update', 'estimate', id, 'Updated estimate');
      await fetchEstimates();
      toast.success('Estimate updated successfully');
    } catch (err) {
      const error = handleError(err);
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEstimate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw handleSupabaseError(deleteError);
      }

      await logActivity('delete', 'estimate', id, 'Deleted estimate');
      await fetchEstimates();
      toast.success('Estimate deleted successfully');
    } catch (err) {
      const error = handleError(err);
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    estimates,
    loading,
    error,
    fetchEstimates,
    createEstimate,
    updateEstimate,
    deleteEstimate
  };
};
