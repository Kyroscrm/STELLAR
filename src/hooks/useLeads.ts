import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { useRBAC } from './useRBAC';
import { useEnhancedActivityLogs } from './useEnhancedActivityLogs';

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
  const { hasPermission } = useRBAC();
  const { logEntityChange } = useEnhancedActivityLogs();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const validatePermission = (action: 'read' | 'write' | 'delete'): boolean => {
    const permission = `leads:${action}`;
    if (!hasPermission(permission)) {
      toast.error(`You don't have permission to ${action} leads`);
      return false;
    }
    return true;
  };

  const fetchLeads = async () => {
    if (!validateUserAndSession() || !validatePermission('read')) return;

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
      const leadError = error instanceof Error ? error : new Error('Failed to fetch leads');
      setError(leadError);
      handleError(leadError, { title: 'Failed to fetch leads' });
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: LeadInsert) => {
    if (!validateUserAndSession() || !validatePermission('write')) return null;

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

          // Enhanced activity logging
          await logEntityChange(
            'lead',
            data.id,
            'created',
            null,
            data,
            `Lead created: ${data.first_name} ${data.last_name}`
          );

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
    if (!validateUserAndSession() || !validatePermission('write')) return false;

    // Store original for rollback and change tracking
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

          // Enhanced activity logging with change tracking
          await logEntityChange(
            'lead',
            id,
            'updated',
            originalLead,
            data,
            `Lead updated: ${data.first_name} ${data.last_name}`
          );

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
    if (!validateUserAndSession() || !validatePermission('delete')) return;

    // Store original for rollback and change tracking
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

          // Enhanced activity logging
          await logEntityChange(
            'lead',
            id,
            'deleted',
            originalLead,
            null,
            `Lead deleted: ${originalLead.first_name} ${originalLead.last_name}`
          );

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
      // Error handling is managed by executeUpdate
    }
  };

  const convertToCustomer = async (id: string) => {
    if (!validateUserAndSession() || !validatePermission('write')) return null;

    const lead = leads.find(l => l.id === id);
    if (!lead) {
      toast.error('Lead not found');
      return null;
    }

    try {
      // Create customer from lead data
      const customerData = {
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        city: lead.city,
        state: lead.state,
        zip_code: lead.zip_code,
        notes: lead.notes,
        lead_id: lead.id,
        user_id: user.id
      };

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (customerError) throw customerError;

      // Update lead status to converted
      await updateLead(id, { status: 'converted' });

      // Enhanced activity logging
      await logEntityChange(
        'lead',
        id,
        'updated',
        lead,
        { ...lead, status: 'converted' },
        `Lead converted to customer: ${lead.first_name} ${lead.last_name}`
      );

      await logEntityChange(
        'customer',
        customer.id,
        'created',
        null,
        customer,
        `Customer created from lead: ${customer.first_name} ${customer.last_name}`
      );

      toast.success('Lead successfully converted to customer');
      return customer;
    } catch (error: unknown) {
      const convertError = error instanceof Error ? error : new Error('Failed to convert lead');
      handleError(convertError, { title: 'Failed to convert lead to customer' });
      return null;
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
    deleteLead,
    convertToCustomer
  };
};
