
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EstimatesPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Estimates</h1>
        <p className="text-gray-600">Create and manage project estimates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estimate Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Estimate management features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstimatesPage;
