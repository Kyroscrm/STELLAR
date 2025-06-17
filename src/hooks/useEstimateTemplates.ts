
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

// Type guard to validate line items structure
const isValidLineItems = (data: any): data is EstimateTemplateLineItem[] => {
  if (!Array.isArray(data)) return false;
  return data.every(item => 
    typeof item === 'object' &&
    typeof item.description === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.unit_price === 'number'
  );
};

// Convert database row to EstimateTemplate
const convertDbRowToTemplate = (row: any): EstimateTemplate => {
  let lineItems: EstimateTemplateLineItem[] = [];
  
  // Parse line_items from Json to typed array
  if (row.line_items) {
    try {
      const parsed = typeof row.line_items === 'string' 
        ? JSON.parse(row.line_items) 
        : row.line_items;
      
      if (isValidLineItems(parsed)) {
        lineItems = parsed;
      }
    } catch (error) {
      console.error('Error parsing line_items:', error);
      lineItems = [];
    }
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    line_items: lineItems,
    tax_rate: row.tax_rate,
    terms: row.terms,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

export const useEstimateTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('estimate_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convertedTemplates = (data || []).map(convertDbRowToTemplate);
      setTemplates(convertedTemplates);
    } catch (error: any) {
      console.error('Error fetching estimate templates:', error);
      setError(error.message);
      toast.error('Failed to fetch estimate templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<EstimateTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    // Optimistic update
    const optimisticTemplate: EstimateTemplate = {
      id: `temp-${Date.now()}`,
      ...templateData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTemplates(prev => [optimisticTemplate, ...prev]);

    try {
      // Convert line_items to Json for database storage
      const dbData = {
        name: templateData.name,
        description: templateData.description,
        line_items: templateData.line_items as any, // Cast to Json type
        tax_rate: templateData.tax_rate,
        terms: templateData.terms,
        notes: templateData.notes,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('estimate_templates')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;

      const convertedTemplate = convertDbRowToTemplate(data);
      
      // Replace optimistic with real data
      setTemplates(prev => prev.map(template => 
        template.id === optimisticTemplate.id ? convertedTemplate : template
      ));
      
      toast.success('Estimate template created successfully');
      return convertedTemplate;
    } catch (error: any) {
      console.error('Error creating estimate template:', error);
      // Rollback optimistic update
      setTemplates(prev => prev.filter(template => template.id !== optimisticTemplate.id));
      toast.error('Failed to create estimate template');
      return null;
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<Omit<EstimateTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return null;

    const originalTemplate = templates.find(t => t.id === id);
    if (!originalTemplate) return null;

    // Optimistic update
    const updatedTemplate = {
      ...originalTemplate,
      ...templateData,
      updated_at: new Date().toISOString(),
    };

    setTemplates(prev => prev.map(template => 
      template.id === id ? updatedTemplate : template
    ));

    try {
      // Convert line_items to Json for database storage if present
      const dbData: any = { ...templateData };
      if (templateData.line_items) {
        dbData.line_items = templateData.line_items as any; // Cast to Json type
      }

      const { data, error } = await supabase
        .from('estimate_templates')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const convertedTemplate = convertDbRowToTemplate(data);
      
      // Update with real data
      setTemplates(prev => prev.map(template => 
        template.id === id ? convertedTemplate : template
      ));
      
      toast.success('Template updated successfully');
      return convertedTemplate;
    } catch (error: any) {
      console.error('Error updating estimate template:', error);
      // Rollback optimistic update
      setTemplates(prev => prev.map(template => 
        template.id === id ? originalTemplate : template
      ));
      toast.error('Failed to update estimate template');
      return null;
    }
  };

  const deleteTemplate = async (id: string) => {
    const originalTemplate = templates.find(t => t.id === id);
    if (!originalTemplate) return;

    // Optimistic update
    setTemplates(prev => prev.filter(template => template.id !== id));

    try {
      const { error } = await supabase
        .from('estimate_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Template deleted successfully');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      // Rollback optimistic update
      setTemplates(prev => [...prev, originalTemplate].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      toast.error('Failed to delete template');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    fetchTemplates
  };
};
