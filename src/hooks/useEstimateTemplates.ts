
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
      
      const typedTemplates = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        line_items: Array.isArray(template.line_items) 
          ? (template.line_items as unknown as EstimateTemplateLineItem[])
          : [],
        tax_rate: template.tax_rate || 0,
        terms: template.terms,
        notes: template.notes,
        created_at: template.created_at
      })) as EstimateTemplate[];
      
      setTemplates(typedTemplates);
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
        .insert({ 
          ...templateData, 
          user_id: user.id,
          line_items: templateData.line_items as any
        })
        .select()
        .single();

      if (error) throw error;

      const newTemplate: EstimateTemplate = {
        id: data.id,
        name: data.name,
        description: data.description,
        line_items: Array.isArray(data.line_items) 
          ? (data.line_items as unknown as EstimateTemplateLineItem[])
          : [],
        tax_rate: data.tax_rate || 0,
        terms: data.terms,
        notes: data.notes,
        created_at: data.created_at
      };

      setTemplates(prev => [...prev, newTemplate]);
      toast.success('Estimate template created successfully');
      return newTemplate;
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
