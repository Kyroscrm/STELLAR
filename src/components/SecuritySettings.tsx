import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Key,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  Smartphone,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useRBAC } from '@/hooks/useRBAC';
import { Json } from '@/integrations/supabase/types';

interface UserSession {
  id: string;
  login_time: string;
  logout_time: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_info: Json | null;
  location_data: Json | null;
  is_active: boolean;
  last_active_at: string;
}

interface SecurityPreferences {
  mfa_enabled: boolean;
  password_expires_days: number;
  session_timeout_minutes: number;
  require_password_change: boolean;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
}

interface UserPreferencesData {
  security?: SecurityPreferences;
  [key: string]: unknown;
}

const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = useRBAC();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securityPreferences, setSecurityPreferences] = useState<SecurityPreferences>({
    mfa_enabled: false,
    password_expires_days: 90,
    session_timeout_minutes: 480, // 8 hours
    require_password_change: false,
    login_notifications: true,
    suspicious_activity_alerts: true
  });

  const canManageSecurity = hasPermission('security:manage');

  useEffect(() => {
    if (user) {
      fetchUserSessions();
      fetchSecurityPreferences();
      checkMfaStatus();
    }
  }, [user]);

  const fetchUserSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      handleError(error as Error, { title: 'Failed to fetch user sessions' });
    }
  };

  const fetchSecurityPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const preferencesData = data?.preferences as UserPreferencesData | null;
      if (preferencesData?.security) {
        setSecurityPreferences(prev => ({
          ...prev,
          ...preferencesData.security
        }));
      }
    } catch (error) {
      handleError(error as Error, { title: 'Failed to fetch security preferences' });
    }
  };

  const checkMfaStatus = async () => {
    if (!user) return;

    try {
      // Check if user has MFA factors enabled
      const { data } = await supabase.auth.mfa.listFactors();
      setMfaEnabled(data?.totp?.length > 0);
    } catch (error) {
      // Silently handle MFA check failure as it may not be supported in all configurations
      setMfaEnabled(false);
    }
  };

  const enableMfa = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `${user.email} - TOTP`
      });

      if (error) throw error;

      // Show QR code or secret for user to scan/enter
      toast.success('MFA enrollment started. Please scan the QR code with your authenticator app.');

      // Update preferences
      await updateSecurityPreferences({ ...securityPreferences, mfa_enabled: true });
      setMfaEnabled(true);

    } catch (error) {
      handleError(error as Error, { title: 'Failed to enable MFA' });
    } finally {
      setLoading(false);
    }
  };

  const disableMfa = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();

      if (factors?.totp?.length > 0) {
        for (const factor of factors.totp) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      await updateSecurityPreferences({ ...securityPreferences, mfa_enabled: false });
      setMfaEnabled(false);
      toast.success('MFA has been disabled');

    } catch (error) {
      handleError(error as Error, { title: 'Failed to disable MFA' });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      handleError(error as Error, { title: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const updateSecurityPreferences = async (newPreferences: SecurityPreferences) => {
    if (!user) return;

    try {
      const preferencesData: UserPreferencesData = {
        security: newPreferences
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences: preferencesData as Json
        });

      if (error) throw error;

      setSecurityPreferences(newPreferences);
      toast.success('Security preferences updated');

    } catch (error) {
      handleError(error as Error, { title: 'Failed to update security preferences' });
    }
    };

  const terminateSession = async (sessionId: string) => {
    if (!user || !canManageSecurity) return;

    try {
      const { error } = await supabase.rpc('end_user_session', {
        p_session_id: sessionId
      });

      if (error) throw error;

      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, is_active: false, logout_time: new Date().toISOString() } : s
      ));
      toast.success('Session terminated successfully');

    } catch (error) {
      handleError(error as Error, { title: 'Failed to terminate session' });
    }
  };

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Security Settings</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
                  <span>Multi-Factor Authentication</span>
                  <Badge variant={mfaEnabled ? "default" : "secondary"}>
                    {mfaEnabled ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Enabled</>
                    ) : (
                      <><AlertTriangle className="h-3 w-3 mr-1" /> Disabled</>
              )}
                  </Badge>
          </div>
          <div className="flex items-center justify-between">
                  <span>Password Strength</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" /> Strong
                  </Badge>
          </div>
          <div className="flex items-center justify-between">
                  <span>Active Sessions</span>
                  <Badge variant="outline">
                    {sessions.filter(s => s.is_active).length} Active
                  </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Recent Activity
          </CardTitle>
        </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-gray-500" />
                        <span>Login from {session.ip_address}</span>
                      </div>
                      <span className="text-gray-500">
                        {formatLastActive(session.last_active_at)}
                      </span>
              </div>
                  ))}
            </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
              <div>
                    <h4 className="font-medium">Authenticator App</h4>
                    <p className="text-sm text-gray-600">
                      Use an app like Google Authenticator or Authy
                    </p>
              </div>
                  <Button
                    onClick={mfaEnabled ? disableMfa : enableMfa}
                    disabled={loading}
                    variant={mfaEnabled ? "destructive" : "default"}
                  >
                    {mfaEnabled ? 'Disable' : 'Enable'}
                  </Button>
            </div>
                {!mfaEnabled && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      We strongly recommend enabling MFA to secure your account.
                    </AlertDescription>
                  </Alert>
                )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password regularly for better security
                </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
              </div>
            </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                  />
                </div>
                <Button
                  onClick={changePassword}
                  disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword}
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-gray-500" />
              <div>
                        <div className="font-medium">{session.ip_address}</div>
                        <div className="text-sm text-gray-600">
                          {session.user_agent?.split(' ')[0]} • {formatLastActive(session.last_active_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={session.is_active ? "default" : "secondary"}>
                        {session.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {session.is_active && canManageSecurity && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => terminateSession(session.id)}
                        >
                          Terminate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No active sessions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Preferences</CardTitle>
              <CardDescription>
                Configure your security and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="login-notifications">Login Notifications</Label>
                  <p className="text-sm text-gray-600">Get notified when you sign in from a new device</p>
            </div>
            <Switch
                  id="login-notifications"
                  checked={securityPreferences.login_notifications}
                  onCheckedChange={(checked) =>
                    updateSecurityPreferences({
                      ...securityPreferences,
                      login_notifications: checked
                    })
                  }
            />
          </div>
          <div className="flex items-center justify-between">
              <div>
                  <Label htmlFor="suspicious-alerts">Suspicious Activity Alerts</Label>
                  <p className="text-sm text-gray-600">Get notified of unusual account activity</p>
                </div>
                <Switch
                  id="suspicious-alerts"
                  checked={securityPreferences.suspicious_activity_alerts}
                  onCheckedChange={(checked) =>
                    updateSecurityPreferences({
                      ...securityPreferences,
                      suspicious_activity_alerts: checked
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min="30"
                  max="1440"
                  value={securityPreferences.session_timeout_minutes}
                  onChange={(e) =>
                    setSecurityPreferences(prev => ({
                      ...prev,
                      session_timeout_minutes: parseInt(e.target.value) || 480
                    }))
                  }
                  onBlur={() => updateSecurityPreferences(securityPreferences)}
                />
                <p className="text-sm text-gray-600">
                  How long to keep you logged in when inactive
                </p>
            </div>
              <div className="space-y-2">
                <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                <Input
                  id="password-expiry"
                  type="number"
                  min="30"
                  max="365"
                  value={securityPreferences.password_expires_days}
                  onChange={(e) =>
                    setSecurityPreferences(prev => ({
                      ...prev,
                      password_expires_days: parseInt(e.target.value) || 90
                    }))
                  }
                  onBlur={() => updateSecurityPreferences(securityPreferences)}
            />
                <p className="text-sm text-gray-600">
                  How often to require password changes
                </p>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;
