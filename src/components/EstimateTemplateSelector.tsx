
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEstimateTemplates } from '@/hooks/useEstimateTemplates';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface EstimateTemplateSelectorProps {
  onSelectTemplate: (template: any) => void;
  onCreateNew: () => void;
}

const EstimateTemplateSelector: React.FC<EstimateTemplateSelectorProps> = ({
  onSelectTemplate,
  onCreateNew
}) => {
  const { templates, loading, deleteTemplate } = useEstimateTemplates();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Choose an Estimate Template</h3>
        <Button onClick={onCreateNew} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Start from scratch option */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
          <CardContent className="p-6 text-center" onClick={onCreateNew}>
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Start from Scratch</h4>
                <p className="text-sm text-gray-600">Create a custom estimate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template options */}
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTemplate(template.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0" onClick={() => onSelectTemplate(template)}>
              <div className="space-y-3">
                {template.description && (
                  <p className="text-sm text-gray-600">{template.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {template.line_items?.length || 0} items
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Tax: {((template.tax_rate || 0) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Created {new Date(template.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-4">Create your first estimate template to speed up future quotes</p>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  );
};

export default EstimateTemplateSelector;
