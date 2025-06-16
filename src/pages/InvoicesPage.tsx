
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const InvoicesPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600">Manage billing and invoices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Invoice management features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesPage;
