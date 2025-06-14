
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <Card className="border-dashed border-2 border-gray-200">
      <CardHeader className="text-center py-12">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <CardTitle className="text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center pb-12">
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
