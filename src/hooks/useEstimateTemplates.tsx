import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
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
      const { data, error } = await supabase
        .from('estimate_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
        toast.error('Failed to fetch estimate templates');
      } else {
        const fallbackError = new Error('An unexpected error occurred while fetching estimate templates');
        setError(fallbackError);
        toast.error(fallbackError.message);
      }
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
