
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RetentionPolicy {
  id: string;
  user_id: string;
  table_name: string;
  retention_period: string;
  policy_type: 'automatic' | 'manual' | 'legal_hold';
  compliance_requirement: string;
  auto_delete: boolean;
  created_at: string;
  updated_at: string;
}

type RetentionPolicyUpdate = Omit<RetentionPolicy, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const useDataRetention = () => {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchPolicies = async () => {
    if (!validateUserAndSession()) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching retention policies for user:', user.id);
      
      const { data, error } = await supabase
        .from('data_retention_policies')
        .select('*')
        .eq('user_id', user.id)
        .order('table_name', { ascending: true });

      if (error) throw error;
      
      setPolicies(data || []);
      console.log(`Successfully fetched ${data?.length || 0} retention policies`);
    } catch (error: any) {
      console.error('Error fetching retention policies:', error);
      setError(error);
      toast.error('Failed to fetch retention policies');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async (policyData: Omit<RetentionPolicyUpdate, 'auto_delete'> & { auto_delete?: boolean }) => {
    if (!validateUserAndSession()) return null;

    try {
      console.log('Creating retention policy:', policyData);
      
      const { data, error } = await supabase
        .from('data_retention_policies')
        .insert({ 
          ...policyData, 
          user_id: user.id,
          auto_delete: policyData.auto_delete ?? false
        })
        .select()
        .single();

      if (error) throw error;
      
      setPolicies(prev => [...prev, data]);
      toast.success('Retention policy created successfully');
      console.log('Retention policy created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating retention policy:', error);
      toast.error(error.message || 'Failed to create retention policy');
      return null;
    }
  };

  const updatePolicy = async (id: string, updates: Partial<RetentionPolicyUpdate>) => {
    if (!validateUserAndSession()) return false;

    try {
      console.log('Updating retention policy:', id, updates);
      
      const { data, error } = await supabase
        .from('data_retention_policies')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setPolicies(prev => prev.map(p => p.id === id ? data : p));
      toast.success('Retention policy updated successfully');
      console.log('Retention policy updated successfully:', data);
      return true;
    } catch (error: any) {
      console.error('Error updating retention policy:', error);
      toast.error(error.message || 'Failed to update retention policy');
      return false;
    }
  };

  const deletePolicy = async (id: string) => {
    if (!validateUserAndSession()) return;

    try {
      console.log('Deleting retention policy:', id);
      
      const { error } = await supabase
        .from('data_retention_policies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setPolicies(prev => prev.filter(p => p.id !== id));
      toast.success('Retention policy deleted successfully');
      console.log('Retention policy deleted successfully');
    } catch (error: any) {
      console.error('Error deleting retention policy:', error);
      toast.error(error.message || 'Failed to delete retention policy');
    }
  };

  const runCleanup = async () => {
    if (!validateUserAndSession()) return false;

    try {
      console.log('Running data cleanup based on retention policies');
      
      const { data, error } = await supabase.rpc('cleanup_audit_records');

      if (error) throw error;
      
      toast.success(`Data cleanup completed. ${data || 0} records processed.`);
      console.log('Data cleanup completed:', data);
      return true;
    } catch (error: any) {
      console.error('Error running data cleanup:', error);
      toast.error('Failed to run data cleanup');
      return false;
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchPolicies();
    }
  }, [user, session]);

  return {
    policies,
    loading,
    error,
    fetchPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    runCleanup
  };
};
