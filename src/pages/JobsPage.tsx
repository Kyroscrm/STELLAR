
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const JobsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
        <p className="text-gray-600">Manage your active projects and jobs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Job management features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobsPage;
