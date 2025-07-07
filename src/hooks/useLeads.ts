import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRBAC } from '@/hooks/useRBAC';

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  source: 'website' | 'referral' | 'google_ads' | 'facebook' | 'direct_mail' | 'cold_call' | 'trade_show' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost' | 'converted';
  notes?: string;
  created_at: string;
  updated_at: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  estimated_value?: number;
  expected_close_date?: string;
  user_id: string;
}

export const useLeads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { hasPermission } = useRBAC();

  const fetchLeads = useCallback(async () => {
    if (!user) return;

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
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch leads'));
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ ...lead, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setLeads(prev => [data, ...prev]);
      toast.success('Lead added successfully');
      return data;
    } catch (err) {
      toast.error('Failed to add lead');
      throw err;
    }
  }, [user]);

  const updateLead = useCallback(async (id: string, updates: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, ...data } : lead));
      toast.success('Lead updated successfully');
      return data;
    } catch (err) {
      toast.error('Failed to update lead');
      throw err;
    }
  }, [user]);

  const deleteLead = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast.success('Lead deleted successfully');
    } catch (err) {
      toast.error('Failed to delete lead');
      throw err;
    }
  }, [user]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    addLead,
    updateLead,
    deleteLead
  };
};
