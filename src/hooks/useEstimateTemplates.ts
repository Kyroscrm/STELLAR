
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EstimateTemplateLineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface EstimateTemplate {
  id: string;
  name: string;
  description?: string;
  line_items: EstimateTemplateLineItem[];
  tax_rate: number;
  terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching estimate templates:', error);
      toast.error('Failed to fetch estimate templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<EstimateTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('estimate_templates')
        .insert({
          ...templateData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      toast.success('Estimate template created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating estimate template:', error);
      toast.error('Failed to create estimate template');
      return null;
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<Omit<EstimateTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('estimate_templates')
        .update(templateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => prev.map(template => 
        template.id === id ? data : template
      ));
      toast.success('Template updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating estimate template:', error);
      toast.error('Failed to update estimate template');
      return null;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('estimate_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== id));
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
    updateTemplate,
    deleteTemplate,
    fetchTemplates
  };
};
