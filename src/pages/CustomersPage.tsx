
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CustomersPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600">Manage your customer database</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Customer management features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersPage;
