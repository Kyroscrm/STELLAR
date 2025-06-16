
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Plus, FileText } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  tax_rate: number;
  terms: string;
  notes: string;
  line_items: any[];
}

interface EstimateTemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  onCreateNew: () => void;
}

const EstimateTemplateSelector: React.FC<EstimateTemplateSelectorProps> = ({
  onSelectTemplate,
  onCreateNew
}) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('estimate_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Choose a Template</h3>
        <Button onClick={onCreateNew} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create from Scratch
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No templates found</p>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">{template.name}</CardTitle>
                {template.description && (
                  <p className="text-sm text-gray-600">{template.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>Tax Rate: {(template.tax_rate * 100).toFixed(1)}%</p>
                  <p>Line Items: {template.line_items?.length || 0}</p>
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={() => onSelectTemplate(template)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EstimateTemplateSelector;
