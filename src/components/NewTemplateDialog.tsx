import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { useEstimateTemplates, EstimateTemplate } from '@/hooks/useEstimateTemplates';
import { toast } from 'sonner';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  tax_rate: z.number().min(0).max(1),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface NewTemplateDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const NewTemplateDialog: React.FC<NewTemplateDialogProps> = ({
  trigger,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0 }
  ]);
  const { createTemplate } = useEstimateTemplates();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      tax_rate: 0.08,
      terms: '',
      notes: '',
    },
  });

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setLineItems(updatedItems);
  };

  const handleSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    try {
      // Validate line items
      const validLineItems = lineItems.filter(item =>
        item.description.trim() && item.quantity > 0 && item.unit_price >= 0
      ).map(item => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price
      }));

      const templateData: Omit<EstimateTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        name: data.name,
        description: data.description || null,
        tax_rate: data.tax_rate,
        terms: data.terms || null,
        notes: data.notes || null,
        line_items: validLineItems
      };

      console.log('Creating template with data:', templateData);

      const result = await createTemplate(templateData);

      if (result) {
        setOpen(false);
        form.reset();
        setLineItems([{ description: '', quantity: 1, unit_price: 0 }]);
        onSuccess?.();
        toast.success('Template created successfully');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    setLineItems([{ description: '', quantity: 1, unit_price: 0 }]);
  };

  const defaultTrigger = (
    <Button variant="outline">
      <Plus className="h-4 w-4 mr-2" />
      New Template
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Estimate Template
          </DialogTitle>
          <DialogDescription>
            Create a reusable template with predefined line items, terms, and pricing for faster estimate creation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Basic Roofing Estimate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="8.0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) / 100)}
                        value={field.value ? (field.value * 100).toString() : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this template"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Line Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">Line Items</h4>
                <Button type="button" onClick={addLineItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-5">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700">Quantity</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700">Unit Price</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700">Total</label>
                      <Input
                        type="text"
                        value={`$${(item.quantity * item.unit_price).toFixed(2)}`}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Payment due within 30 days"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., All materials included in estimate"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Template'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTemplateDialog;
