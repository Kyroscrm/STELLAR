
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';
import { useEstimateTemplates, EstimateTemplate } from '@/hooks/useEstimateTemplates';

interface EstimateTemplateSelectorProps {
  onSelectTemplate: (template: EstimateTemplate) => void;
  onCreateNew: () => void;
}

const EstimateTemplateSelector: React.FC<EstimateTemplateSelectorProps> = ({
  onSelectTemplate,
  onCreateNew
}) => {
  const { templates, loading } = useEstimateTemplates();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select Template</h3>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Start from Scratch
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Template</h3>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Start from Scratch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {template.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Tax Rate: {(template.tax_rate * 100).toFixed(1)}%</p>
                <p>Line Items: {template.line_items.length}</p>
                {template.notes && <p>Notes: {template.notes}</p>}
                {template.description && <p>Description: {template.description}</p>}
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => onSelectTemplate(template)}
              >
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No templates available</p>
          <Button onClick={onCreateNew} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create First Template
          </Button>
        </div>
      )}
    </div>
  );
};

export default EstimateTemplateSelector;
