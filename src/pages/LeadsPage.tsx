
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LeadsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600">Manage your sales leads</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Lead management features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsPage;
