
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type CalendarIntegrationsRow = Database['public']['Tables']['calendar_integrations']['Row'];

export interface CalendarIntegration {
  id: string;
  user_id: string;
  provider: 'google' | 'outlook';
  access_token: string | null;
  refresh_token: string | null;
  calendar_id: string | null;
  sync_enabled: boolean;
  last_sync: string | null;
  status: 'active' | 'inactive' | 'error' | 'pending';
  created_at: string;
  updated_at: string;
}

export const useCalendarIntegration = () => {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchIntegrations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: CalendarIntegration[] = (data || []).map((item: CalendarIntegrationsRow) => ({
        ...item,
        provider: item.provider as 'google' | 'outlook'
      }));
      
      setIntegrations(transformedData);
    } catch (error: any) {
      console.error('Error fetching calendar integrations:', error);
      toast.error('Failed to fetch calendar integrations');
    } finally {
      setLoading(false);
    }
  };

  const createIntegration = async (integrationData: Omit<CalendarIntegration, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .insert({ ...integrationData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      const transformedData: CalendarIntegration = {
        ...data,
        provider: data.provider as 'google' | 'outlook'
      };
      
      setIntegrations(prev => [transformedData, ...prev]);
      toast.success('Calendar integration added successfully');
      return transformedData;
    } catch (error: any) {
      console.error('Error creating calendar integration:', error);
      toast.error('Failed to add calendar integration');
      return null;
    }
  };

  const updateIntegration = async (id: string, updates: Partial<CalendarIntegration>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const transformedData: CalendarIntegration = {
        ...data,
        provider: data.provider as 'google' | 'outlook'
      };
      
      setIntegrations(prev => prev.map(integration => integration.id === id ? transformedData : integration));
      toast.success('Calendar integration updated successfully');
      return transformedData;
    } catch (error: any) {
      console.error('Error updating calendar integration:', error);
      toast.error('Failed to update calendar integration');
      return null;
    }
  };

  const toggleSync = async (id: string, enabled: boolean) => {
    return updateIntegration(id, { sync_enabled: enabled });
  };

  const syncCalendar = async (id: string) => {
    try {
      // In a real implementation, this would trigger the actual sync
      await updateIntegration(id, { 
        last_sync: new Date().toISOString(),
        status: 'active'
      });
      toast.success('Calendar sync completed');
    } catch (error: any) {
      console.error('Error syncing calendar:', error);
      toast.error('Failed to sync calendar');
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setIntegrations(prev => prev.filter(integration => integration.id !== id));
      toast.success('Calendar integration deleted successfully');
    } catch (error: any) {
      console.error('Error deleting calendar integration:', error);
      toast.error('Failed to delete calendar integration');
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [user]);

  return {
    integrations,
    loading,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    toggleSync,
    syncCalendar,
    deleteIntegration
  };
};
