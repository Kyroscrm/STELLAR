
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Key, 
  Eye, 
  Mail, 
  Smartphone,
  Clock,
  Database,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    sessionTimeout: 30,
    autoBackup: true,
    loginAlerts: true,
    dataEncryption: true,
    auditLogging: true
  });

  const handleSettingChange = (key: string, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Setting updated');
  };

  const enable2FA = async () => {
    toast.info('Two-factor authentication setup would be implemented here');
    // In a real app, this would integrate with authentication provider
  };

  const changePassword = async () => {
    toast.info('Password change functionality would be implemented here');
    // In a real app, this would integrate with Supabase auth
  };

  const downloadSecurityReport = () => {
    const report = {
      user: user?.email,
      timestamp: new Date().toISOString(),
      settings: settings,
      securityScore: 85
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Security report downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-blue-600" />
              <div>
                <Label className="font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.twoFactorEnabled}
                onCheckedChange={(checked) => handleSettingChange('twoFactorEnabled', checked)}
              />
              {!settings.twoFactorEnabled && (
                <Button onClick={enable2FA} size="sm" variant="outline">
                  Setup
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <Label className="font-medium">Login Alerts</Label>
                <p className="text-sm text-gray-600">Get notified of new logins</p>
              </div>
            </div>
            <Switch
              checked={settings.loginAlerts}
              onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <Label className="font-medium">Session Timeout</Label>
                <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', Number(e.target.value))}
                className="w-20"
                min="5"
                max="120"
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={changePassword} variant="outline">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Security Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <Label className="font-medium">Email Notifications</Label>
                <p className="text-sm text-gray-600">Security alerts via email</p>
              </div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <div>
                <Label className="font-medium">SMS Notifications</Label>
                <p className="text-sm text-gray-600">Critical alerts via SMS</p>
              </div>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-purple-600" />
              <div>
                <Label className="font-medium">Automatic Backups</Label>
                <p className="text-sm text-gray-600">Daily data backup</p>
              </div>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <Label className="font-medium">Data Encryption</Label>
                <p className="text-sm text-gray-600">Encrypt sensitive data</p>
              </div>
            </div>
            <Switch
              checked={settings.dataEncryption}
              onCheckedChange={(checked) => handleSettingChange('dataEncryption', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-yellow-600" />
              <div>
                <Label className="font-medium">Audit Logging</Label>
                <p className="text-sm text-gray-600">Track all user actions</p>
              </div>
            </div>
            <Switch
              checked={settings.auditLogging}
              onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Download detailed security reports for compliance and auditing purposes.
          </p>
          <Button onClick={downloadSecurityReport} variant="outline">
            Download Security Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
