import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEstimates } from '@/hooks/useEstimates';
import { useEstimateTemplates } from '@/hooks/useEstimateTemplates';
import { Lead } from '@/hooks/useLeads';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CreateEstimateFromLeadDialogProps {
  lead: Lead;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateEstimateFromLeadDialog = React.forwardRef<HTMLButtonElement, CreateEstimateFromLeadDialogProps>(({
  lead,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSuccess
}, ref) => {
  const { createEstimate } = useEstimates();
  const { templates } = useEstimateTemplates();
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  const [formData, setFormData] = useState({
    title: `Estimate for ${lead.first_name} ${lead.last_name}`,
    description: '',
    template_id: '',
    tax_rate: 0,
    terms: '',
    notes: ''
  });

  const defaultTrigger = (
    <Button ref={ref} variant="ghost" size="sm">
      <FileText className="h-4 w-4 mr-2" />
      Create Estimate
    </Button>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Estimate title is required');
      return;
    }

    setLoading(true);
    try {
      const selectedTemplate = templates.find(t => t.id === formData.template_id);

      const estimateData = {
        title: formData.title,
        description: formData.description,
        tax_rate: formData.tax_rate / 100, // Convert percentage to decimal
        terms: formData.terms,
        notes: formData.notes,
        status: 'draft' as const,
        estimate_number: `EST-${Date.now()}`,
        line_items: selectedTemplate?.line_items || []
      };

      const result = await createEstimate(estimateData);

      if (result) {
        toast.success('Estimate created successfully from lead');
        setOpen(false);
        resetForm();
        onSuccess?.();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to create estimate: ${error.message}`);
      } else {
        toast.error('Failed to create estimate');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: `Estimate for ${lead.first_name} ${lead.last_name}`,
      description: '',
      template_id: '',
      tax_rate: 0,
      terms: '',
      notes: ''
    });
  };

  const handleTemplateChange = (templateId: string) => {
    setFormData(prev => ({ ...prev, template_id: templateId }));

    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        tax_rate: selectedTemplate.tax_rate * 100, // Convert to percentage for display
        terms: selectedTemplate.terms || prev.terms,
        notes: selectedTemplate.notes || prev.notes
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Estimate from Lead</DialogTitle>
          <DialogDescription>
            Create a new estimate for {lead.first_name} {lead.last_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lead Info Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Lead Information</h4>
            <p className="text-blue-700 text-sm">
              {lead.first_name} {lead.last_name}
              {lead.email && ` • ${lead.email}`}
              {lead.estimated_value && ` • Estimated Value: $${lead.estimated_value.toLocaleString()}`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Estimate Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter estimate title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter estimate description"
              rows={3}
            />
          </div>

          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>Use Template (Optional)</Label>
              <Select value={formData.template_id} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template to pre-fill line items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              placeholder="Enter payment terms and conditions"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes for this estimate"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Estimate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

CreateEstimateFromLeadDialog.displayName = 'CreateEstimateFromLeadDialog';

export default CreateEstimateFromLeadDialog;
