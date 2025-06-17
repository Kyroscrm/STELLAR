
import React, { useState } from 'react';
import { useEstimateTemplates } from '@/hooks/useEstimateTemplates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Settings, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface EstimateTemplateSelectorProps {
  onSelectTemplate: (template: any) => void;
  onCreateNew: () => void;
}

const EstimateTemplateSelector: React.FC<EstimateTemplateSelectorProps> = ({
  onSelectTemplate,
  onCreateNew
}) => {
  const { templates, loading } = useEstimateTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplateId(template.id);
    onSelectTemplate(template);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
          <p className="text-gray-500 mb-6">
            Select from your saved templates or create a new estimate from scratch.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
        <p className="text-gray-500 mb-6">
          Select from your saved templates or create a new estimate from scratch.
        </p>
        <div className="flex gap-4 justify-center mb-6">
          <Button onClick={onCreateNew} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create from Scratch
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/settings?tab=templates">
              <Settings className="h-4 w-4 mr-2" />
              Manage Templates
            </Link>
          </Button>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium mb-2">No Templates Found</h4>
          <p className="text-gray-500 mb-6">
            Create your first template in Settings to get started quickly with future estimates.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={onCreateNew}>
              Create New Estimate
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/settings?tab=templates">
                Create Template
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {template.name}
                </CardTitle>
                {template.description && (
                  <p className="text-sm text-gray-600">{template.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Line Items:</span>
                  <Badge variant="secondary">{template.line_items?.length || 0}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Tax Rate:</span>
                  <Badge variant="outline">{(template.tax_rate * 100).toFixed(1)}%</Badge>
                </div>
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTemplate(template);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
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
