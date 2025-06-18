
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';

interface EstimateTemplateSelectorProps {
  onSelectTemplate: (template: any) => void;
  onCreateNew: () => void;
}

const EstimateTemplateSelector: React.FC<EstimateTemplateSelectorProps> = ({
  onSelectTemplate,
  onCreateNew
}) => {
  // Mock templates for now - in a real app this would come from a hook
  const templates = [
    {
      id: '1',
      name: 'Basic Roofing Estimate',
      tax_rate: 0.08,
      terms: 'Payment due within 30 days',
      notes: 'All materials included',
      line_items: [
        {
          description: 'Roofing materials',
          quantity: 1,
          unit_price: 1000
        },
        {
          description: 'Labor',
          quantity: 8,
          unit_price: 50
        }
      ]
    },
    {
      id: '2',
      name: 'Gutter Installation',
      tax_rate: 0.08,
      terms: 'Payment due upon completion',
      notes: 'Includes cleanup',
      line_items: [
        {
          description: 'Gutter materials',
          quantity: 100,
          unit_price: 8
        },
        {
          description: 'Installation labor',
          quantity: 4,
          unit_price: 60
        }
      ]
    }
  ];

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
