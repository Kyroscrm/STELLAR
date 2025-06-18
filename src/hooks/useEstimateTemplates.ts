
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Override the Supabase type to have proper line_items type for frontend
export type EstimateTemplate = Omit<Tables<'estimate_templates'>, 'line_items'> & {
  line_items: any[];
};

export const useEstimateTemplates = () => {
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const parseLineItems = (lineItems: any): any[] => {
    if (!lineItems) return [];
    
    if (Array.isArray(lineItems)) {
      return lineItems;
    }
    
    if (typeof lineItems === 'string') {
      try {
        const parsed = JSON.parse(lineItems);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('Error parsing line items string:', error);
        return [];
      }
    }
    
    if (typeof lineItems === 'object') {
      // If it's a JSON object, try to extract array-like data
      if (lineItems.length !== undefined && typeof lineItems.length === 'number') {
        return Array.from(lineItems);
      }
      // If it's a regular object, wrap it in an array
      return [lineItems];
    }
    
    return [];
  };

  const fetchTemplates = async () => {
    if (!validateUserAndSession()) return;
    
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
      
      // Convert Json line_items to array for frontend use
      const templatesWithParsedLineItems = (data || []).map(template => {
        const lineItems = parseLineItems(template.line_items);
        
        return {
          ...template,
          line_items: lineItems
        };
      });
      
      setTemplates(templatesWithParsedLineItems);
      console.log(`Successfully fetched ${templatesWithParsedLineItems.length} estimate templates`);
    } catch (error: any) {
      console.error('Error fetching estimate templates:', error);
      setError(error);
      toast.error('Failed to fetch estimate templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<EstimateTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!validateUserAndSession()) return null;

    try {
      console.log('Creating template with data:', templateData);
      
      // Ensure line_items is properly formatted for database storage
      const dataForStorage = {
        ...templateData,
        user_id: user.id,
        line_items: templateData.line_items || []
      };

      console.log('Data for storage:', dataForStorage);

      const { data, error } = await supabase
        .from('estimate_templates')
        .insert(dataForStorage)
        .select()
        .single();

      if (error) throw error;
      
      // Convert back to frontend format
      const lineItems = parseLineItems(data.line_items);
      
      const templateWithParsedLineItems = {
        ...data,
        line_items: lineItems
      };
      
      setTemplates(prev => [templateWithParsedLineItems, ...prev]);
      toast.success('Template created successfully');
      return templateWithParsedLineItems;
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<EstimateTemplate>) => {
    if (!validateUserAndSession()) return false;

    try {
      // Ensure line_items is properly formatted if present
      const updatesForStorage = {
        ...updates,
        ...(updates.line_items && { line_items: updates.line_items })
      };

      const { data, error } = await supabase
        .from('estimate_templates')
        .update(updatesForStorage)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Convert back to frontend format
      const lineItems = parseLineItems(data.line_items);
      
      const templateWithParsedLineItems = {
        ...data,
        line_items: lineItems
      };
      
      setTemplates(prev => prev.map(t => t.id === id ? templateWithParsedLineItems : t));
      toast.success('Template updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
      return false;
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!validateUserAndSession()) return;

    try {
      const { error } = await supabase
        .from('estimate_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

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
  }, [user, session]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
};
