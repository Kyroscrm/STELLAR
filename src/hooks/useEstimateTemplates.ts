
import { useState, useEffect } from 'react';
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

  // For now, we'll use localStorage to store templates until we have a proper database table
  const STORAGE_KEY = 'estimate_templates';

  const fetchTemplates = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (stored) {
        const parsedTemplates = JSON.parse(stored);
        setTemplates(parsedTemplates);
      } else {
        // Set some default templates
        const defaultTemplates: EstimateTemplate[] = [
          {
            id: 'default-1',
            name: 'Basic Service Package',
            description: 'Standard service package for most projects',
            line_items: [
              { description: 'Initial Consultation', quantity: 1, unit_price: 150 },
              { description: 'Service Fee', quantity: 1, unit_price: 500 },
              { description: 'Materials', quantity: 1, unit_price: 300 }
            ],
            tax_rate: 0.08,
            terms: 'Payment due within 30 days of completion.',
            notes: 'All materials included in estimate.',
            created_at: new Date().toISOString()
          },
          {
            id: 'default-2',
            name: 'Premium Service Package',
            description: 'Premium service package with additional features',
            line_items: [
              { description: 'Detailed Assessment', quantity: 1, unit_price: 250 },
              { description: 'Premium Service', quantity: 1, unit_price: 800 },
              { description: 'Premium Materials', quantity: 1, unit_price: 500 },
              { description: 'Follow-up Support', quantity: 1, unit_price: 200 }
            ],
            tax_rate: 0.08,
            terms: 'Payment due within 30 days. 50% deposit required to start.',
            notes: 'Includes premium materials and extended support.',
            created_at: new Date().toISOString()
          }
        ];
        setTemplates(defaultTemplates);
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(defaultTemplates));
      }
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
      const newTemplate: EstimateTemplate = {
        ...templateData,
        id: `template-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(updatedTemplates));
      
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
      const updatedTemplates = templates.filter(t => t.id !== id);
      setTemplates(updatedTemplates);
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(updatedTemplates));
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
