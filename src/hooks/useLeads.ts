import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export type Lead = Tables<'leads'>;
type LeadInsert = Omit<TablesInsert<'leads'>, 'user_id'>;
type LeadUpdate = TablesUpdate<'leads'>;

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();
  const { executeUpdate } = useOptimisticUpdate();
  const { handleError } = useErrorHandler();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchLeads = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeads(data || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
        handleError(error, { title: 'Failed to fetch leads' });
      } else {
        const fallbackError = new Error('An unexpected error occurred while fetching leads');
        setError(fallbackError);
        handleError(fallbackError, { title: 'Failed to fetch leads' });
      }
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: LeadInsert) => {
    if (!validateUserAndSession()) return null;

    const optimisticLead: Lead = {
      id: `temp-${Date.now()}`,
      ...leadData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Lead;

    try {
      return await executeUpdate(
        // Optimistic update
        () => setLeads(prev => [optimisticLead, ...prev]),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('leads')
            .insert({ ...leadData, user_id: user.id })
            .select()
            .single();

          if (error) throw error;

          // Replace optimistic with real data
          setLeads(prev => prev.map(l => l.id === optimisticLead.id ? data : l));

          // Log activity
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            entity_type: 'lead',
            entity_id: data.id,
            action: 'created',
            description: `Lead created: ${data.first_name} ${data.last_name}`
          });

          return data;
        },
        // Rollback
        () => setLeads(prev => prev.filter(l => l.id !== optimisticLead.id)),
        {
          successMessage: 'Lead created successfully',
          errorMessage: 'Failed to create lead'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const updateLead = async (id: string, updates: LeadUpdate) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalLead = leads.find(l => l.id === id);
    if (!originalLead) {
      toast.error('Lead not found');
      return false;
    }

    const optimisticLead = { ...originalLead, ...updates, updated_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setLeads(prev => prev.map(l => l.id === id ? optimisticLead : l)),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) throw error;

          // Update with real data
          setLeads(prev => prev.map(l => l.id === id ? data : l));

          // Log activity
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            entity_type: 'lead',
            entity_id: id,
            action: 'updated',
            description: `Lead updated: ${data.first_name} ${data.last_name}`
          });

          return true;
        },
        // Rollback
        () => setLeads(prev => prev.map(l => l.id === id ? originalLead : l)),
        {
          successMessage: 'Lead updated successfully',
          errorMessage: 'Failed to update lead'
        }
      );
    } catch (error: unknown) {
      return false;
    }
  };

  const deleteLead = async (id: string) => {
    if (!validateUserAndSession()) return;

    // Store original for rollback
    const originalLead = leads.find(l => l.id === id);
    if (!originalLead) {
      toast.error('Lead not found');
      return;
    }

    try {
      await executeUpdate(
        // Optimistic update
        () => setLeads(prev => prev.filter(l => l.id !== id)),
        // Actual update
        async () => {
          const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          // Log activity
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            entity_type: 'lead',
            entity_id: id,
            action: 'deleted',
            description: `Lead deleted: ${originalLead.first_name} ${originalLead.last_name}`
          });

          return true;
        },
        // Rollback
        () => setLeads(prev => [...prev, originalLead].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )),
        {
          successMessage: 'Lead deleted successfully',
          errorMessage: 'Failed to delete lead'
        }
      );
    } catch (error: unknown) {
      // Error handling is done within executeUpdate
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user, session]);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  };
};
