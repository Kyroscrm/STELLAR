
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
      
      // Convert Json line_items to array for frontend use
      const templatesWithParsedLineItems = (data || []).map(template => ({
        ...template,
        line_items: (() => {
          try {
            return Array.isArray(template.line_items) 
              ? template.line_items 
              : JSON.parse(template.line_items as string);
          } catch {
            return [];
          }
        })()
      }));
      
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
    if (!user) return null;

    try {
      // Convert line_items array to Json for storage
      const dataForStorage = {
        ...templateData,
        user_id: user.id,
        line_items: JSON.stringify(templateData.line_items)
      };

      const { data, error } = await supabase
        .from('estimate_templates')
        .insert(dataForStorage)
        .select()
        .single();

      if (error) throw error;
      
      // Convert back to frontend format
      const templateWithParsedLineItems = {
        ...data,
        line_items: (() => {
          try {
            return Array.isArray(data.line_items) 
              ? data.line_items 
              : JSON.parse(data.line_items as string);
          } catch {
            return [];
          }
        })()
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
    if (!user) return false;

    try {
      // Convert line_items array to Json for storage if present
      const updatesForStorage = {
        ...updates,
        ...(updates.line_items && { line_items: JSON.stringify(updates.line_items) })
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
      const templateWithParsedLineItems = {
        ...data,
        line_items: (() => {
          try {
            return Array.isArray(data.line_items) 
              ? data.line_items 
              : JSON.parse(data.line_items as string);
          } catch {
            return [];
          }
        })()
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
    if (!user) return;

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
  }, [user]);

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
