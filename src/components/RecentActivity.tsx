
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  User, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Calendar
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'task' | 'invoice' | 'lead' | 'project' | 'customer';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  status?: 'completed' | 'pending' | 'urgent' | 'new';
}

const RecentActivity: React.FC = () => {
  // Mock data - in real app, this would come from your activity logs
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'project',
      title: 'Kitchen Renovation Completed',
      description: 'Johnson residence project marked as completed',
      user: 'Mike Thompson',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'invoice',
      title: 'Invoice INV-2024-156 Sent',
      description: 'Invoice for $15,450 sent to Smith family',
      user: 'Sarah Davis',
      timestamp: '4 hours ago',
      status: 'pending'
    },
    {
      id: '3',
      type: 'lead',
      title: 'New Lead Assigned',
      description: 'Roof replacement inquiry from downtown area',
      user: 'Alex Johnson',
      timestamp: '6 hours ago',
      status: 'new'
    },
    {
      id: '4',
      type: 'task',
      title: 'Site Inspection Scheduled',
      description: 'Pre-construction meeting set for Wilson project',
      user: 'Mike Thompson',
      timestamp: '8 hours ago',
      status: 'pending'
    },
    {
      id: '5',
      type: 'customer',
      title: 'Customer Review Received',
      description: '5-star review from the Anderson family',
      user: 'System',
      timestamp: '1 day ago',
      status: 'completed'
    },
    {
      id: '6',
      type: 'invoice',
      title: 'Payment Received',
      description: '$8,900 payment processed for Martinez project',
      user: 'Sarah Davis',
      timestamp: '1 day ago',
      status: 'completed'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle className="h-4 w-4" />;
      case 'invoice':
        return <DollarSign className="h-4 w-4" />;
      case 'lead':
        return <User className="h-4 w-4" />;
      case 'project':
        return <FileText className="h-4 w-4" />;
      case 'customer':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">New</Badge>;
      default:
        return null;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-500';
      case 'invoice':
        return 'bg-green-500';
      case 'lead':
        return 'bg-purple-500';
      case 'project':
        return 'bg-orange-500';
      case 'customer':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)} text-white flex-shrink-0`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {activity.user}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                  {activity.status && (
                    <div className="flex-shrink-0">
                      {getStatusBadge(activity.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Activity
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
