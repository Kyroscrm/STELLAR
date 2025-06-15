
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
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Omit<LeadInsert, 'user_id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({ ...leadData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
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
      toast.error('Failed to create lead');
      return null;
    }
  };

  const updateLead = async (id: string, updates: LeadUpdate) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      toast.success('Lead updated successfully');
      
      // Log activity
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          entity_type: 'lead',
          entity_id: id,
          action: 'updated',
          description: `Lead updated`
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
      return null;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast.success('Lead deleted successfully');
      
      // Log activity
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          entity_type: 'lead',
          entity_id: id,
          action: 'deleted',
          description: `Lead deleted`
        });
      }
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  useEffect(() => {
    fetchLeads();
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
