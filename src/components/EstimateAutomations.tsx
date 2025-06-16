import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Zap
} from 'lucide-react';
import { useEstimateAutomations } from '@/hooks/useEstimateAutomations';

interface EstimateAutomationsProps {
  estimateId: string;
}

const EstimateAutomations: React.FC<EstimateAutomationsProps> = ({ estimateId }) => {
  const { automations, loading, createAutomation, updateAutomation, deleteAutomation } = useEstimateAutomations(estimateId);
  
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    trigger_type: '',
    action_type: '',
    days: 1
  });

  const triggerOptions = [
    { value: 'estimate_sent', label: 'When estimate is sent' },
    { value: 'estimate_viewed', label: 'When estimate is viewed' },
    { value: 'time_based', label: 'Time-based trigger' },
    { value: 'status_change', label: 'When status changes' }
  ];

  const actionOptions = [
    { value: 'send_email', label: 'Send email reminder' },
    { value: 'update_status', label: 'Update status' },
    { value: 'create_task', label: 'Create follow-up task' },
    { value: 'send_notification', label: 'Send notification' }
  ];

  const toggleAutomation = (id: string) => {
    const automation = automations.find(auto => auto.id === id);
    if (automation) {
      updateAutomation(id, { enabled: !automation.enabled });
    }
  };

  const addAutomation = async () => {
    if (!newAutomation.name || !newAutomation.trigger_type || !newAutomation.action_type) {
      return;
    }

    const result = await createAutomation({
      name: newAutomation.name,
      trigger_type: newAutomation.trigger_type,
      action_type: newAutomation.action_type,
      enabled: true,
      conditions: { days: newAutomation.days }
    });

    if (result) {
      setNewAutomation({ name: '', trigger_type: '', action_type: '', days: 1 });
    }
  };

  const handleDeleteAutomation = (id: string) => {
    deleteAutomation(id);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Estimate Automations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading automations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Estimate Automations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Automations */}
        <div className="space-y-3">
          {automations.map((automation) => (
            <div key={automation.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  checked={automation.enabled}
                  onCheckedChange={() => toggleAutomation(automation.id)}
                />
                <div>
                  <p className="font-medium">{automation.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Trigger: {automation.trigger_type.replace('_', ' ')}</span>
                    <Badge variant="outline">{automation.action_type.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteAutomation(automation.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Automation */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Add New Automation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Automation name"
              value={newAutomation.name}
              onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
            />
            <Select onValueChange={(value) => setNewAutomation(prev => ({ ...prev, trigger_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                {triggerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setNewAutomation(prev => ({ ...prev, action_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Days"
              min="1"
              value={newAutomation.days}
              onChange={(e) => setNewAutomation(prev => ({ ...prev, days: Number(e.target.value) }))}
            />
          </div>
          <Button onClick={addAutomation} className="mt-3">
            <Plus className="h-4 w-4 mr-2" />
            Add Automation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateAutomations;
