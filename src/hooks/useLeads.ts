
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { toast } from 'sonner';

export interface Lead {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'proposal_sent' | 'negotiating' | 'won' | 'lost';
  source: 'website' | 'referral' | 'google_ads' | 'facebook' | 'direct_mail' | 'cold_call' | 'trade_show' | 'other';
  score: number;
  estimated_value?: number;
  expected_close_date?: string;
  created_at: string;
  updated_at: string;
}

// Normalize database response to frontend types
const normalizeLeadStatus = (status: string): Lead['status'] => {
  const statusMap: Record<string, Lead['status']> = {
    'proposal_sent': 'proposal_sent',
    'negotiating': 'negotiating'
  };
  return statusMap[status] || status as Lead['status'];
};

const normalizeLeadSource = (source: string): Lead['source'] => {
  const sourceMap: Record<string, Lead['source']> = {
    'social_media': 'facebook',
    'social': 'facebook',
    'advertising': 'google_ads'
  };
  return sourceMap[source] || source as Lead['source'];
};

// Normalize frontend data to database-compatible format
const normalizeSourceForDB = (source: string): 'website' | 'referral' | 'google_ads' | 'facebook' | 'direct_mail' | 'cold_call' | 'trade_show' | 'other' => {
  const sourceMap: Record<string, 'website' | 'referral' | 'google_ads' | 'facebook' | 'direct_mail' | 'cold_call' | 'trade_show' | 'other'> = {
    'social': 'facebook',
    'advertising': 'google_ads'
  };
  return sourceMap[source] || source as 'website' | 'referral' | 'google_ads' | 'facebook' | 'direct_mail' | 'cold_call' | 'trade_show' | 'other';
};

export const useLeads = () => {
  const { user } = useAuth();
  const { logActivity } = useActivityLogs();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeads = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching leads for user:', user.id);
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Normalize data to match frontend types
      const normalizedLeads = (data || []).map(lead => ({
        ...lead,
        status: normalizeLeadStatus(lead.status),
        source: normalizeLeadSource(lead.source)
      }));
      
      setLeads(normalizedLeads);
      console.log(`Successfully fetched ${normalizedLeads.length} leads`);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Authentication required');
      return null;
    }

    // Ensure score is provided and normalize source for database
    const leadWithScore = {
      ...leadData,
      score: leadData.score ?? 0,
      source: normalizeSourceForDB(leadData.source)
    };

    // Optimistic update
    const tempLead: Lead = {
      ...leadData,
      id: `temp-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setLeads(prev => [tempLead, ...prev]);

    try {
      console.log('Creating lead:', leadWithScore);
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadWithScore,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Normalize and replace optimistic update with real data
      const normalizedLead = {
        ...data,
        status: normalizeLeadStatus(data.status),
        source: normalizeLeadSource(data.source)
      };
      
      setLeads(prev => prev.map(l => l.id === tempLead.id ? normalizedLead : l));
      
      await logActivity('create', 'lead', data.id, `Created lead: ${data.first_name} ${data.last_name}`);
      toast.success('Lead created successfully');
      return normalizedLead;
    } catch (error: any) {
      console.error('Error creating lead:', error);
      // Rollback optimistic update
      setLeads(prev => prev.filter(l => l.id !== tempLead.id));
      toast.error('Failed to create lead');
      return null;
    }
  };

  const updateLead = async (id: string, updates: Partial<Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Normalize source if it's being updated
    const normalizedUpdates = {
      ...updates,
      ...(updates.source && { source: normalizeSourceForDB(updates.source) })
    };

    // Optimistic update
    const optimisticLead = leads.find(l => l.id === id);
    if (optimisticLead) {
      setLeads(prev => prev.map(l => 
        l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
      ));
    }

    try {
      console.log('Updating lead:', id, normalizedUpdates);
      
      const { data, error } = await supabase
        .from('leads')
        .update(normalizedUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Normalize and update with real data
      const normalizedLead = {
        ...data,
        status: normalizeLeadStatus(data.status),
        source: normalizeLeadSource(data.source)
      };
      
      setLeads(prev => prev.map(l => l.id === id ? normalizedLead : l));
      
      await logActivity('update', 'lead', id, `Updated lead: ${data.first_name} ${data.last_name}`);
      toast.success('Lead updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating lead:', error);
      // Rollback optimistic update
      if (optimisticLead) {
        setLeads(prev => prev.map(l => l.id === id ? optimisticLead : l));
      }
      toast.error('Failed to update lead');
      return false;
    }
  };

  const deleteLead = async (id: string) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Optimistic update
    const leadToDelete = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));

    try {
      console.log('Deleting lead:', id);
      
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await logActivity('delete', 'lead', id, `Deleted lead: ${leadToDelete?.first_name} ${leadToDelete?.last_name}`);
      toast.success('Lead deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      // Rollback optimistic update
      if (leadToDelete) {
        setLeads(prev => [...prev, leadToDelete].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
      toast.error('Failed to delete lead');
      return false;
    }
  };

  // Set up real-time updates
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time leads subscription for user:', user.id);

    const channel = supabase
      .channel(`leads-${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads', 
          filter: `user_id=eq.${user.id}` 
        }, 
        () => {
          console.log('Leads data changed, refetching...');
          fetchLeads();
        }
      )
      .subscribe();

    // Initial fetch
    fetchLeads();

    return () => {
      console.log('Cleaning up leads subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    leads,
    loading,
    createLead,
    updateLead,
    deleteLead,
    fetchLeads
  };
};
