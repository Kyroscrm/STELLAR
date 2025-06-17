
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
  Calendar,
  Shield,
  Activity,
  Eye
} from 'lucide-react';
import { useEnhancedActivityLogs } from '@/hooks/useEnhancedActivityLogs';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import RealTimeStatusIndicator from './RealTimeStatusIndicator';

const RecentActivity: React.FC = () => {
  const { user } = useAuth();
  const { logs: activities, loading } = useEnhancedActivityLogs({ 
    limit: 10, 
    includeAudit: true 
  });
  const [showAuditDetails, setShowAuditDetails] = useState(false);

  const getActivityIcon = (entityType: string, action: string) => {
    switch (entityType) {
      case 'task':
      case 'tasks':
        return <CheckCircle className="h-4 w-4" />;
      case 'invoice':
      case 'invoices':
        return <DollarSign className="h-4 w-4" />;
      case 'lead':
      case 'leads':
        return <User className="h-4 w-4" />;
      case 'job':
      case 'jobs':
        return <FileText className="h-4 w-4" />;
      case 'customer':
      case 'customers':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (action: string, complianceLevel?: string, riskScore?: number) => {
    // Show compliance level if available (from audit trail)
    if (complianceLevel) {
      switch (complianceLevel) {
        case 'critical':
          return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
        case 'high':
          return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High Risk</Badge>;
        case 'standard':
          return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Standard</Badge>;
      }
    }

    // Fallback to action-based badges
    switch (action.toLowerCase()) {
      case 'completed':
      case 'created':
      case 'insert':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'updated':
      case 'modified':
      case 'update':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Updated</Badge>;
      case 'deleted':
      case 'delete':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Deleted</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{action}</Badge>;
    }
  };

  const getActivityColor = (entityType: string, complianceLevel?: string) => {
    if (complianceLevel) {
      switch (complianceLevel) {
        case 'critical':
          return 'bg-red-500';
        case 'high':
          return 'bg-orange-500';
        case 'standard':
          return 'bg-blue-500';
      }
    }

    switch (entityType) {
      case 'task':
      case 'tasks':
        return 'bg-blue-500';
      case 'invoice':
      case 'invoices':
        return 'bg-green-500';
      case 'lead':
      case 'leads':
        return 'bg-purple-500';
      case 'job':
      case 'jobs':
        return 'bg-orange-500';
      case 'customer':
      case 'customers':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const getRiskScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Recent Activity
            {activities.some(a => a.audit_trail_id) && (
              <Shield className="h-4 w-4 text-blue-500" title="Enhanced with audit trail" />
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAuditDetails(!showAuditDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              {showAuditDetails ? 'Hide' : 'Show'} Details
            </button>
            <RealTimeStatusIndicator />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No recent activity found</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full ${getActivityColor(activity.entity_type, activity.compliance_level)} text-white flex-shrink-0 relative`}>
                  {getActivityIcon(activity.entity_type, activity.action)}
                  {activity.audit_trail_id && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 capitalize">
                        {activity.action} {activity.entity_type}
                        {activity.risk_score && (
                          <span className={`ml-2 text-xs ${getRiskScoreColor(activity.risk_score)}`}>
                            (Risk: {activity.risk_score})
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description || `${activity.action} a ${activity.entity_type}`}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatTimeAgo(activity.created_at)}
                        </div>
                        {activity.audit_trail_id && (
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Audited
                          </div>
                        )}
                      </div>
                      {showAuditDetails && activity.metadata && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          {activity.metadata.changed_fields && (
                            <div>
                              <strong>Changed:</strong> {activity.metadata.changed_fields.join(', ')}
                            </div>
                          )}
                          {activity.metadata.ip_address && (
                            <div>
                              <strong>IP:</strong> {activity.metadata.ip_address}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(activity.action, activity.compliance_level, activity.risk_score)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
