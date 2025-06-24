import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface AutomationRule {
  id: string;
  name: string;
  trigger_type: string;
  action_type: string;
  enabled: boolean;
  conditions: Record<string, unknown>;
  estimate_id?: string;
  created_at: string;
  updated_at: string;
}

export const useEstimateAutomations = (estimateId?: string) => {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAutomations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('estimate_automations')
        .select('*')
        .eq('user_id', user.id);

      if (estimateId) {
        query = query.eq('estimate_id', estimateId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setAutomations(data || []);
    } catch (error: unknown) {
      toast.error('Failed to fetch automations');
    } finally {
      setLoading(false);
    }
  };

  const createAutomation = async (automationData: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('estimate_automations')
        .insert({
          ...automationData,
          user_id: user.id,
          estimate_id: estimateId || null
        })
        .select()
        .single();

      if (error) throw error;

      setAutomations(prev => [data, ...prev]);
      toast.success('Automation created successfully');
      return data;
    } catch (error: unknown) {
      toast.error('Failed to create automation');
      return null;
    }
  };

  const updateAutomation = async (id: string, updates: Partial<Omit<AutomationRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('estimate_automations')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setAutomations(prev => prev.map(automation =>
        automation.id === id ? data : automation
      ));
      toast.success('Automation updated successfully');
      return true;
    } catch (error: unknown) {
      toast.error('Failed to update automation');
      return false;
    }
  };

  const deleteAutomation = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('estimate_automations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAutomations(prev => prev.filter(automation => automation.id !== id));
      toast.success('Automation deleted successfully');
    } catch (error: unknown) {
      toast.error('Failed to delete automation');
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [user, estimateId]);

  return {
    automations,
    loading,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    fetchAutomations
  };
};
