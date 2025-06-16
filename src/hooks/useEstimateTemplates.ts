
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

      const convertedTemplates = (data || []).map(convertDbRowToTemplate);
      setTemplates(convertedTemplates);
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
      setTemplates(prev => [convertedTemplate, ...prev]);
      toast.success('Estimate template created successfully');
      return convertedTemplate;
    } catch (error: any) {
      console.error('Error creating estimate template:', error);
      toast.error('Failed to create estimate template');
      return null;
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<Omit<EstimateTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return null;

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
      setTemplates(prev => prev.map(template => 
        template.id === id ? convertedTemplate : template
      ));
      toast.success('Template updated successfully');
      return convertedTemplate;
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
