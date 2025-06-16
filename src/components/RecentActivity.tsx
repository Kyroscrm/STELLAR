
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  metadata?: any;
}

const RecentActivity: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [user]);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load recent activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (entityType: string, action: string) => {
    switch (entityType) {
      case 'task':
        return <CheckCircle className="h-4 w-4" />;
      case 'invoice':
        return <DollarSign className="h-4 w-4" />;
      case 'lead':
        return <User className="h-4 w-4" />;
      case 'job':
        return <FileText className="h-4 w-4" />;
      case 'customer':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'completed':
      case 'created':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'updated':
      case 'modified':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Updated</Badge>;
      case 'deleted':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Deleted</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{action}</Badge>;
    }
  };

  const getActivityColor = (entityType: string) => {
    switch (entityType) {
      case 'task':
        return 'bg-blue-500';
      case 'invoice':
        return 'bg-green-500';
      case 'lead':
        return 'bg-purple-500';
      case 'job':
        return 'bg-orange-500';
      case 'customer':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <LoadingSpinner size="lg" text="Loading recent activity..." />
        </CardContent>
      </Card>
    );
  }

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
          {activities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No recent activity found</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full ${getActivityColor(activity.entity_type)} text-white flex-shrink-0`}>
                  {getActivityIcon(activity.entity_type, activity.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 capitalize">
                        {activity.action} {activity.entity_type}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description || `${activity.action} a ${activity.entity_type}`}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatTimeAgo(activity.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(activity.action)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <button 
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={loadActivities}
            >
              Refresh Activity
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
