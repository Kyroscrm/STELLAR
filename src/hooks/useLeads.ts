
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Lead = Tables<'leads'>;
type LeadInsert = TablesInsert<'leads'>;
type LeadUpdate = TablesUpdate<'leads'>;

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchLeads = async () => {
    if (!user) {
      console.log('No user available for fetching leads');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching leads for user:', user.id);
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} leads`);
      setLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Omit<LeadInsert, 'user_id'>) => {
    if (!user) {
      toast.error('You must be logged in to create leads');
      return null;
    }

    try {
      console.log('Creating lead:', leadData);
      
      const { data, error } = await supabase
        .from('leads')
        .insert({ ...leadData, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error creating lead:', error);
        throw error;
      }
      
      console.log('Lead created successfully:', data);
      setLeads(prev => [data, ...prev]);
      toast.success('Lead created successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'lead',
        entity_id: data.id,
        action: 'created',
        description: `Lead created for ${data.first_name} ${data.last_name}`
      });

      return data;
    } catch (error: any) {
      console.error('Error creating lead:', error);
      toast.error(error.message || 'Failed to create lead');
      return null;
    }
  };

  const updateLead = async (id: string, updates: LeadUpdate) => {
    if (!user) {
      toast.error('You must be logged in to update leads');
      return null;
    }

    try {
      console.log('Updating lead:', id, updates);
      
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lead:', error);
        throw error;
      }
      
      console.log('Lead updated successfully:', data);
      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      toast.success('Lead updated successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'lead',
        entity_id: id,
        action: 'updated',
        description: `Lead updated`
      });

      return data;
    } catch (error: any) {
      console.error('Error updating lead:', error);
      toast.error(error.message || 'Failed to update lead');
      return null;
    }
  };

  const deleteLead = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete leads');
      return;
    }

    try {
      console.log('Deleting lead:', id);
      
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting lead:', error);
        throw error;
      }
      
      console.log('Lead deleted successfully');
      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast.success('Lead deleted successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'lead',
        entity_id: id,
        action: 'deleted',
        description: `Lead deleted`
      });
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      toast.error(error.message || 'Failed to delete lead');
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  return {
    leads,
    loading,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  };
};
