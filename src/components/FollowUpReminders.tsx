
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFollowUpReminders } from '@/hooks/useFollowUpReminders';
import { 
  Clock, 
  CheckCircle, 
  X, 
  User, 
  FileText, 
  Receipt,
  Calendar
} from 'lucide-react';

const FollowUpReminders = () => {
  const { reminders, loading, markAsSent, dismissReminder } = useFollowUpReminders();

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'lead': return <User className="h-4 w-4" />;
      case 'estimate': return <FileText className="h-4 w-4" />;
      case 'invoice': return <Receipt className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'estimate': return 'bg-purple-100 text-purple-800';
      case 'invoice': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (reminderDate: string) => {
    return new Date(reminderDate) < new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Follow-up Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Follow-up Reminders
          {reminders.length > 0 && (
            <Badge variant="secondary">{reminders.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No pending reminders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`p-4 rounded-lg border ${
                  isOverdue(reminder.reminder_date)
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getEntityColor(reminder.entity_type)}>
                        {getEntityIcon(reminder.entity_type)}
                        <span className="ml-1 capitalize">{reminder.entity_type}</span>
                      </Badge>
                      {isOverdue(reminder.reminder_date) && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                    
                    <p className="font-medium mb-1">{reminder.message}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(reminder.reminder_date).toLocaleDateString()}
                      </div>
                      {reminder.entity_data && (
                        <span>
                          {reminder.entity_type === 'lead' && reminder.entity_data.first_name
                            ? `${reminder.entity_data.first_name} ${reminder.entity_data.last_name}`
                            : reminder.entity_data.title || reminder.entity_data.estimate_number || reminder.entity_data.invoice_number}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsSent(reminder.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissReminder(reminder.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowUpReminders;
