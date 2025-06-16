
// This component is deprecated - templates are now managed in Settings > Templates
// Individual estimates should be created with actual customer/job data only
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EstimateTemplateSelectorProps {
  onSelectTemplate?: (template: any) => void;
  onCreateNew: () => void;
}

const EstimateTemplateSelector: React.FC<EstimateTemplateSelectorProps> = ({
  onCreateNew
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Create New Estimate</h3>
        <p className="text-gray-500 mb-6">
          Templates are now managed in Settings. Create estimates with actual customer data.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={onCreateNew}>
            Create Estimate
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/settings?tab=templates">
              <Settings className="h-4 w-4 mr-2" />
              Manage Templates
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EstimateTemplateSelector;
