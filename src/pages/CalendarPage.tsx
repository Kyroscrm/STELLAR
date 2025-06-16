
import React from 'react';
import CalendarScheduler from '@/components/CalendarScheduler';

const CalendarPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Calendar & Scheduling</h1>
              <p className="text-blue-100 text-lg">Manage appointments, tasks, and events in one place</p>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop"
                alt="Calendar scheduling"
                className="rounded-lg shadow-lg w-64 h-32 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      <CalendarScheduler />
    </div>
  );
};

export default CalendarPage;
