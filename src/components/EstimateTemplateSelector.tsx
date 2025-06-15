
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEstimateTemplates } from '@/hooks/useEstimateTemplates';
import { FileText, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface EstimateTemplateSelectorProps {
  onSelectTemplate: (template: any) => void;
  onCreateNew: () => void;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

const EstimateTemplateSelector: React.FC<EstimateTemplateSelectorProps> = ({
  onSelectTemplate,
  onCreateNew
}) => {
  const { templates, loading, createTemplate, deleteTemplate } = useEstimateTemplates();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    tax_rate: 0,
    terms: '',
    notes: '',
    line_items: [] as LineItem[]
  });

  const addLineItemToTemplate = () => {
    setNewTemplate({
      ...newTemplate,
      line_items: [...newTemplate.line_items, { description: '', quantity: 1, unit_price: 0 }]
    });
  };

  const updateTemplateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...newTemplate.line_items];
    updated[index] = { ...updated[index], [field]: value };
    setNewTemplate({ ...newTemplate, line_items: updated });
  };

  const removeTemplateLineItem = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      line_items: newTemplate.line_items.filter((_, i) => i !== index)
    });
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (newTemplate.line_items.length === 0) {
      toast.error('At least one line item is required');
      return;
    }

    const result = await createTemplate(newTemplate);
    if (result) {
      setShowCreateDialog(false);
      setNewTemplate({
        name: '',
        description: '',
        tax_rate: 0,
        terms: '',
        notes: '',
        line_items: []
      });
      toast.success('Template created successfully');
    }
  };

  const resetForm = () => {
    setNewTemplate({
      name: '',
      description: '',
      tax_rate: 0,
      terms: '',
      notes: '',
      line_items: []
    });
    setEditingTemplate(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Choose an Estimate Template</h3>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Template Name *</label>
                    <Input
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tax Rate (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newTemplate.tax_rate * 100}
                      onChange={(e) => setNewTemplate({ ...newTemplate, tax_rate: Number(e.target.value) / 100 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    placeholder="Template description"
                  />
                </div>

                {/* Line Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Template Line Items
                      <Button size="sm" onClick={addLineItemToTemplate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {newTemplate.line_items.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No line items yet</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600">
                          <div className="col-span-6">Description</div>
                          <div className="col-span-2">Quantity</div>
                          <div className="col-span-2">Unit Price</div>
                          <div className="col-span-1">Total</div>
                          <div className="col-span-1"></div>
                        </div>
                        
                        {newTemplate.line_items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6">
                              <Input
                                value={item.description}
                                onChange={(e) => updateTemplateLineItem(index, 'description', e.target.value)}
                                placeholder="Item description"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateTemplateLineItem(index, 'quantity', Number(e.target.value))}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => updateTemplateLineItem(index, 'unit_price', Number(e.target.value))}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="col-span-1 text-right font-medium">
                              ${(item.quantity * item.unit_price).toFixed(2)}
                            </div>
                            <div className="col-span-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTemplateLineItem(index)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Terms & Conditions</label>
                    <Textarea
                      value={newTemplate.terms}
                      onChange={(e) => setNewTemplate({ ...newTemplate, terms: e.target.value })}
                      placeholder="Enter terms and conditions"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={newTemplate.notes}
                      onChange={(e) => setNewTemplate({ ...newTemplate, notes: e.target.value })}
                      placeholder="Enter notes"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={onCreateNew}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Start from scratch option */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
          <CardContent className="p-6 text-center" onClick={onCreateNew}>
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Start from Scratch</h4>
                <p className="text-sm text-gray-600">Create a custom estimate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template options */}
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTemplate(template.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0" onClick={() => onSelectTemplate(template)}>
              <div className="space-y-3">
                {template.description && (
                  <p className="text-sm text-gray-600">{template.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {template.line_items?.length || 0} items
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Tax: {((template.tax_rate || 0) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Created {new Date(template.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-4">Create your first estimate template to speed up future quotes</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  );
};

export default EstimateTemplateSelector;
