
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
  const { user } = useAuth();

  const fetchLeads = async () => {
    if (!user) {
      setLeads([]);
      return;
    }
    
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
      console.log(`Fetched ${data?.length || 0} leads`);
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
    if (!user) {
      toast.error('You must be logged in to create leads');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({ ...leadData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setLeads(prev => [data, ...prev]);
      toast.success('Lead created successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'lead',
        entity_id: data.id,
        action: 'created',
        description: `Lead created: ${data.first_name} ${data.last_name}`
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
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      toast.success('Lead updated successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'lead',
        entity_id: id,
        action: 'updated',
        description: `Lead updated`
      });

      return true;
    } catch (error: any) {
      console.error('Error updating lead:', error);
      toast.error(error.message || 'Failed to update lead');
      return false;
    }
  };

  const deleteLead = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete leads');
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast.success('Lead deleted successfully');
      
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

  const convertToCustomer = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to convert leads');
      return null;
    }

    try {
      const lead = leads.find(l => l.id === id);
      if (!lead) {
        toast.error('Lead not found');
        return null;
      }

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
          city: lead.city,
          state: lead.state,
          zip_code: lead.zip_code,
          notes: lead.notes,
          lead_id: lead.id
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Update lead status to "won" instead of "converted" to match enum
      await updateLead(id, { status: 'won' });
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'lead',
        entity_id: id,
        action: 'converted',
        description: `Lead converted to customer: ${lead.first_name} ${lead.last_name}`
      });

      toast.success('Lead converted to customer successfully');
      return customer;
    } catch (error: any) {
      console.error('Error converting lead:', error);
      toast.error(error.message || 'Failed to convert lead');
      return null;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

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
