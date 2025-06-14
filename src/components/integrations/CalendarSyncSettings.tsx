
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, RefreshCw, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';
import { toast } from 'sonner';

const CalendarSyncSettings = () => {
  const { integrations, loading, createIntegration, updateIntegration, toggleSync, syncCalendar, deleteIntegration } = useCalendarIntegration();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    provider: 'google' as const,
    calendar_id: '',
    sync_enabled: true,
    status: 'pending' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createIntegration({
      ...formData,
      access_token: null,
      refresh_token: null,
      last_sync: null
    });
    if (result) {
      setShowAddForm(false);
      setFormData({ provider: 'google', calendar_id: '', sync_enabled: true, status: 'pending' });
    }
  };

  const handleOAuthConnect = (provider: 'google' | 'outlook') => {
    // In a real implementation, this would redirect to OAuth flow
    toast.info(`Redirecting to ${provider} OAuth...`);
    // Simulate OAuth success
    setTimeout(() => {
      createIntegration({
        provider,
        calendar_id: `${provider}_calendar_123`,
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        sync_enabled: true,
        status: 'active',
        last_sync: new Date().toISOString()
      });
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Calendar Sync Settings</h2>
          <p className="text-gray-600">Connect your calendar apps for seamless scheduling</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Calendar
        </Button>
      </div>

      {/* Quick Connect Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOAuthConnect('google')}>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-2">Google Calendar</h3>
            <p className="text-sm text-gray-500">Connect your Google Calendar for two-way sync</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOAuthConnect('outlook')}>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-2">Outlook Calendar</h3>
            <p className="text-sm text-gray-500">Connect your Outlook Calendar for two-way sync</p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Calendar Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Calendar Provider</Label>
                  <Select value={formData.provider} onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Calendar</SelectItem>
                      <SelectItem value="outlook">Outlook Calendar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="calendar_id">Calendar ID</Label>
                  <Input
                    id="calendar_id"
                    value={formData.calendar_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, calendar_id: e.target.value }))}
                    placeholder="primary or calendar ID"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.sync_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sync_enabled: checked }))}
                />
                <Label>Enable automatic sync</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Calendar</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Calendar Integrations List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading calendar integrations...</div>
            </CardContent>
          </Card>
        ) : integrations.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No calendar integrations configured</p>
                <p className="text-sm">Connect your calendar to sync appointments and events</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          integrations.map((integration) => (
            <Card key={integration.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integration.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{integration.provider} Calendar</span>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                        {integration.sync_enabled && (
                          <Badge variant="outline">Auto-sync enabled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Calendar ID: {integration.calendar_id}
                      </p>
                      {integration.last_sync && (
                        <p className="text-sm text-gray-500">
                          Last sync: {new Date(integration.last_sync).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Switch
                      checked={integration.sync_enabled}
                      onCheckedChange={(checked) => toggleSync(integration.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncCalendar(integration.id)}
                      disabled={!integration.sync_enabled}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteIntegration(integration.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-way Sync</p>
              <p className="text-sm text-gray-500">Sync events both ways between calendars</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-sync Interval</p>
              <p className="text-sm text-gray-500">How often to automatically sync calendars</p>
            </div>
            <Select defaultValue="15">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Conflict Resolution</p>
              <p className="text-sm text-gray-500">How to handle scheduling conflicts</p>
            </div>
            <Select defaultValue="manual">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual review</SelectItem>
                <SelectItem value="latest">Use latest change</SelectItem>
                <SelectItem value="crm">CRM takes priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSyncSettings;
