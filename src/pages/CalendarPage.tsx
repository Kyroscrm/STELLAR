
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CalendarPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600">Schedule and manage appointments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Calendar features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
