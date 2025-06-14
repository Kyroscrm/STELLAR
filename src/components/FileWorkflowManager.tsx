
import React, { useState } from 'react';
import { useFileWorkflow } from '@/hooks/useFileWorkflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Settings, 
  FileText, 
  Workflow,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FileWorkflowManager = () => {
  const { policies, workflows, loading, createPolicy, createWorkflow, updatePolicy, deletePolicy } = useFileWorkflow();
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    page_type: '',
    entity_type: '',
    allowed_file_types: [] as string[],
    max_file_size: 10485760, // 10MB
    max_files_per_entity: 10,
    require_approval: false,
    auto_organize: true
  });

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    page_type: '',
    entity_type: '',
    is_active: true,
    steps: [
      { step_order: 1, step_type: 'upload' as const, step_config: {}, is_required: true },
      { step_order: 2, step_type: 'review' as const, step_config: {}, is_required: false },
      { step_order: 3, step_type: 'organize' as const, step_config: {}, is_required: true }
    ]
  });

  const pageTypes = ['customers', 'jobs', 'estimates', 'invoices', 'leads', 'tasks'];
  const entityTypes = ['customer', 'job', 'estimate', 'invoice', 'lead', 'task'];
  const fileTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'xlsx', 'csv'];

  const handleCreatePolicy = async () => {
    const result = await createPolicy(newPolicy);
    if (result) {
      setShowPolicyDialog(false);
      setNewPolicy({
        page_type: '',
        entity_type: '',
        allowed_file_types: [],
        max_file_size: 10485760,
        max_files_per_entity: 10,
        require_approval: false,
        auto_organize: true
      });
    }
  };

  const handleCreateWorkflow = async () => {
    const result = await createWorkflow(
      {
        name: newWorkflow.name,
        page_type: newWorkflow.page_type,
        entity_type: newWorkflow.entity_type,
        is_active: newWorkflow.is_active
      },
      newWorkflow.steps
    );
    if (result) {
      setShowWorkflowDialog(false);
      setNewWorkflow({
        name: '',
        page_type: '',
        entity_type: '',
        is_active: true,
        steps: [
          { step_order: 1, step_type: 'upload', step_config: {}, is_required: true },
          { step_order: 2, step_type: 'review', step_config: {}, is_required: false },
          { step_order: 3, step_type: 'organize', step_config: {}, is_required: true }
        ]
      });
    }
  };

  const handleFileTypeToggle = (fileType: string) => {
    setNewPolicy(prev => ({
      ...prev,
      allowed_file_types: prev.allowed_file_types.includes(fileType)
        ? prev.allowed_file_types.filter(type => type !== fileType)
        : [...prev.allowed_file_types, fileType]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">File Management</h2>
        <div className="flex gap-2">
          <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                New Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create File Policy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="page_type">Page Type</Label>
                    <Select value={newPolicy.page_type} onValueChange={(value) => setNewPolicy(prev => ({ ...prev, page_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select page type" />
                      </SelectTrigger>
                      <SelectContent>
                        {pageTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="entity_type">Entity Type</Label>
                    <Select value={newPolicy.entity_type} onValueChange={(value) => setNewPolicy(prev => ({ ...prev, entity_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        {entityTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Allowed File Types</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {fileTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={type}
                          checked={newPolicy.allowed_file_types.includes(type)}
                          onChange={() => handleFileTypeToggle(type)}
                        />
                        <Label htmlFor={type}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max_file_size">Max File Size (MB)</Label>
                    <Input
                      id="max_file_size"
                      type="number"
                      value={Math.round(newPolicy.max_file_size / 1024 / 1024)}
                      onChange={(e) => setNewPolicy(prev => ({ ...prev, max_file_size: parseInt(e.target.value) * 1024 * 1024 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_files">Max Files per Entity</Label>
                    <Input
                      id="max_files"
                      type="number"
                      value={newPolicy.max_files_per_entity}
                      onChange={(e) => setNewPolicy(prev => ({ ...prev, max_files_per_entity: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newPolicy.require_approval}
                      onCheckedChange={(checked) => setNewPolicy(prev => ({ ...prev, require_approval: checked }))}
                    />
                    <Label>Require Approval</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newPolicy.auto_organize}
                      onCheckedChange={(checked) => setNewPolicy(prev => ({ ...prev, auto_organize: checked }))}
                    />
                    <Label>Auto Organize</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowPolicyDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePolicy}>
                    Create Policy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create File Workflow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workflow_name">Workflow Name</Label>
                  <Input
                    id="workflow_name"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter workflow name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workflow_page_type">Page Type</Label>
                    <Select value={newWorkflow.page_type} onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, page_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select page type" />
                      </SelectTrigger>
                      <SelectContent>
                        {pageTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="workflow_entity_type">Entity Type</Label>
                    <Select value={newWorkflow.entity_type} onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, entity_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        {entityTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newWorkflow.is_active}
                    onCheckedChange={(checked) => setNewWorkflow(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWorkflow}>
                    Create Workflow
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* File Policies */}
      <div>
        <h3 className="text-lg font-semibold mb-4">File Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {policy.page_type} / {policy.entity_type}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deletePolicy(policy.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {policy.allowed_file_types.map(type => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    Max: {Math.round(policy.max_file_size / 1024 / 1024)}MB, {policy.max_files_per_entity} files
                  </div>
                  <div className="flex gap-2">
                    {policy.require_approval && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approval Required
                      </Badge>
                    )}
                    {policy.auto_organize && (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Auto Organize
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Workflows */}
      <div>
        <h3 className="text-lg font-semibold mb-4">File Workflows</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{workflow.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {workflow.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {workflow.page_type} / {workflow.entity_type}
                  </div>
                  <div className="space-y-2">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className="text-xs bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
                          {step.step_order}
                        </span>
                        <span className="text-sm capitalize">{step.step_type}</span>
                        {step.is_required && (
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileWorkflowManager;
