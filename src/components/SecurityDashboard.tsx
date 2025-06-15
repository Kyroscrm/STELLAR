
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Lock,
  Users,
  Activity,
  Database
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityMetrics {
  activeUsers: number;
  recentLogins: number;
  failedAttempts: number;
  dataIntegrity: boolean;
  backupStatus: 'current' | 'outdated' | 'missing';
}

const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeUsers: 0,
    recentLogins: 0,
    failedAttempts: 0,
    dataIntegrity: true,
    backupStatus: 'current'
  });
  const [securityScore, setSecurityScore] = useState(85);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityMetrics();
  }, []);

  const loadSecurityMetrics = async () => {
    try {
      // Simulate security metrics (in real app, these would come from actual monitoring)
      const mockMetrics: SecurityMetrics = {
        activeUsers: Math.floor(Math.random() * 20) + 5,
        recentLogins: Math.floor(Math.random() * 50) + 10,
        failedAttempts: Math.floor(Math.random() * 5),
        dataIntegrity: Math.random() > 0.1,
        backupStatus: ['current', 'outdated', 'missing'][Math.floor(Math.random() * 3)] as any
      };

      setMetrics(mockMetrics);
      
      // Calculate security score based on metrics
      let score = 100;
      if (mockMetrics.failedAttempts > 10) score -= 20;
      if (!mockMetrics.dataIntegrity) score -= 30;
      if (mockMetrics.backupStatus !== 'current') score -= 15;
      
      setSecurityScore(Math.max(0, score));
    } catch (error) {
      console.error('Error loading security metrics:', error);
      toast.error('Failed to load security metrics');
    } finally {
      setLoading(false);
    }
  };

  const runSecurityScan = async () => {
    toast.info('Running security scan...');
    
    // Simulate security scan
    setTimeout(() => {
      const issues = Math.floor(Math.random() * 3);
      if (issues === 0) {
        toast.success('Security scan completed - No issues found');
      } else {
        toast.warning(`Security scan completed - ${issues} minor issues found`);
      }
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>
                  {securityScore}
                </span>
                <span className="text-gray-500">/100</span>
                {getScoreBadge(securityScore)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Overall Security Score</p>
            </div>
            <Button onClick={runSecurityScan} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-xl font-semibold">{metrics.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Recent Logins</p>
                <p className="text-xl font-semibold">{metrics.recentLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Failed Attempts</p>
                <p className="text-xl font-semibold">{metrics.failedAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Data Integrity</p>
                <div className="flex items-center gap-2">
                  {metrics.dataIntegrity ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {metrics.dataIntegrity ? 'Verified' : 'Issues Found'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Lock className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <p className="font-medium">Enable Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security to user accounts</p>
              </div>
              <Badge variant="outline">Recommended</Badge>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Database className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium">Regular Database Backups</p>
                <p className="text-sm text-gray-600">Ensure data is backed up daily</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Activity className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <p className="font-medium">Monitor API Rate Limits</p>
                <p className="text-sm text-gray-600">Prevent abuse with rate limiting</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
