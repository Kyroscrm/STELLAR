
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EstimateTemplate {
  id: string;
  name: string;
  description?: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  tax_rate: number;
  terms?: string;
  notes?: string;
  created_at: string;
}

export const useEstimateTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching estimate templates:', error);
      toast.error('Failed to fetch estimate templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<EstimateTemplate, 'id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('estimate_templates')
        .insert({ ...templateData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [...prev, data]);
      toast.success('Estimate template created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating estimate template:', error);
      toast.error('Failed to create estimate template');
      return null;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('estimate_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted successfully');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    createTemplate,
    deleteTemplate,
    fetchTemplates
  };
};
