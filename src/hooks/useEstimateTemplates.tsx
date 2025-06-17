
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type EstimateTemplate = Tables<'estimate_templates'>;

export const useEstimateTemplates = () => {
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchTemplates = async () => {
    if (!user) {
      setTemplates([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching estimate templates for user:', user.id);
      
      const { data, error } = await supabase
        .from('estimate_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTemplates(data || []);
      console.log(`Successfully fetched ${data?.length || 0} estimate templates`);
    } catch (error: any) {
      console.error('Error fetching estimate templates:', error);
      setError(error);
      toast.error('Failed to fetch estimate templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    error,
    fetchTemplates
  };
};
