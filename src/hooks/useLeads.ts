
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Lead = Tables<'leads'>;
type LeadInsert = Omit<TablesInsert<'leads'>, 'user_id'>;
type LeadUpdate = TablesUpdate<'leads'>;

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
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

  const fetchLeads = async () => {
    if (!validateUserAndSession()) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching leads for user:', user.id);
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setLeads(data || []);
      console.log(`Successfully fetched ${data?.length || 0} leads`);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      setError(error);
      toast.error('Failed to fetch leads');
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

    // Optimistic update
    setLeads(prev => [optimisticLead, ...prev]);

    try {
      console.log('Creating lead:', leadData);
      
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

      toast.success('Lead created successfully');
      console.log('Lead created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating lead:', error);
      // Rollback optimistic update
      setLeads(prev => prev.filter(l => l.id !== optimisticLead.id));
      toast.error(error.message || 'Failed to create lead');
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

    // Optimistic update
    const optimisticLead = { ...originalLead, ...updates, updated_at: new Date().toISOString() };
    setLeads(prev => prev.map(l => l.id === id ? optimisticLead : l));

    try {
      console.log('Updating lead:', id, updates);
      
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

      toast.success('Lead updated successfully');
      console.log('Lead updated successfully:', data);
      return true;
    } catch (error: any) {
      console.error('Error updating lead:', error);
      // Rollback optimistic update
      setLeads(prev => prev.map(l => l.id === id ? originalLead : l));
      toast.error(error.message || 'Failed to update lead');
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

    // Optimistic update
    setLeads(prev => prev.filter(l => l.id !== id));

    try {
      console.log('Deleting lead:', id);
      
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

      toast.success('Lead deleted successfully');
      console.log('Lead deleted successfully');
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      // Rollback optimistic update
      setLeads(prev => [...prev, originalLead].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      toast.error(error.message || 'Failed to delete lead');
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
