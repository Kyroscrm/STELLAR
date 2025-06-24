import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCustomers } from '@/hooks/useCustomers';
import { useJobs } from '@/hooks/useJobs';
import { useJobNumberGenerator } from '@/hooks/useJobNumberGenerator';
import { EstimateWithLineItems } from '@/hooks/useEstimates';
import { estimateSchema, EstimateFormData } from '@/lib/validation';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EstimateTemplateSelector from './EstimateTemplateSelector';
import { EstimateTemplate, EstimateTemplateLineItem } from '@/types/app-types';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { toast } from '@/components/ui/use-toast';

interface EstimateFormProps {
  onSubmit: (data: EstimateFormData & { lineItems: LineItem[] }) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<EstimateWithLineItems>;
  isSubmitting?: boolean;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const EstimateForm: React.FC<EstimateFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false
}) => {
  const { customers } = useCustomers();
  const { jobs } = useJobs();
  const { generateEstimateNumber, loading: generatingNumber } = useJobNumberGenerator();

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const form = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      estimate_number: initialData?.estimate_number || '',
      customer_id: initialData?.customer_id || '',
      job_id: initialData?.job_id || '',
      valid_until: initialData?.valid_until || '',
      tax_rate: initialData?.tax_rate || 0,
      status: initialData?.status || 'draft',
      notes: initialData?.notes || '',
      terms: initialData?.terms || '',
    },
  });

  const handleGenerateEstimateNumber = async () => {
    const estimateNumber = await generateEstimateNumber();
    form.setValue('estimate_number', estimateNumber);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total = Number(updated[index].quantity) * Number(updated[index].unit_price);
    }

    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleTemplateSelect = (template: EstimateTemplate) => {
    // Apply template data to form
    form.setValue('title', template.name);
    form.setValue('tax_rate', template.tax_rate);
    form.setValue('terms', template.terms || '');
    form.setValue('notes', template.notes || '');

    // Apply template line items
    if (template.line_items && Array.isArray(template.line_items)) {
      const templateLineItems = template.line_items.map((item: EstimateTemplateLineItem) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price
      }));

      setLineItems(templateLineItems);
    }

    setShowTemplateSelector(false);
  };

  // Auto-generate estimate number on mount if not provided
  useEffect(() => {
    if (!initialData?.estimate_number) {
      handleGenerateEstimateNumber();
    }
  }, []);

  // Load initial line items if editing
  useEffect(() => {
    if (initialData?.estimate_line_items) {
      const items = initialData.estimate_line_items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.total || 0)
      }));
      setLineItems(items);
    }
  }, [initialData]);

  const handleSubmit = async (data: EstimateFormData) => {
    try {
      await onSubmit({ ...data, lineItems });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error",
        description: `Failed to submit estimate: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  if (showTemplateSelector) {
    return (
      <EstimateTemplateSelector
        onSelectTemplate={handleTemplateSelect}
        onCreateNew={() => setShowTemplateSelector(false)}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header with Template Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Estimate Details</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowTemplateSelector(true)}
          >
            Use Template
            <HelpTooltip content="Load a pre-defined template to quickly create standardized estimates." />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title *
                  <HelpTooltip content="A descriptive name for this estimate that will be visible to customers." />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter estimate title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimate_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Estimate Number *
                  <HelpTooltip content="A unique identifier for this estimate. Click 'Generate' to create a sequential number automatically." />
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="EST-001" {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateEstimateNumber}
                    disabled={generatingNumber}
                  >
                    {generatingNumber ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      'Generate'
                    )}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Customer
                  <HelpTooltip content="Select the customer this estimate is for. This will link the estimate to their account." />
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="job_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Job (Optional)
                  <HelpTooltip content="Optionally link this estimate to a specific job. This helps with tracking project financials." />
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valid_until"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Valid Until
                  <HelpTooltip content="The date until which this estimate is valid. After this date, prices may change." />
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                <FormLabel>
                  Tax Rate (%)
                  <HelpTooltip content="The percentage tax rate to apply to this estimate. Enter as a number (e.g., 7.5 for 7.5%)." />
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
              <FormLabel>
                Description
                <HelpTooltip content="A brief overview of the work covered by this estimate." />
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the estimate"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Line Items */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Line Items
                <HelpTooltip content="Add individual products or services with their quantities and prices." />
              </CardTitle>
              <Button type="button" onClick={addLineItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lineItems.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No items added. Click "Add Item" to begin.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 font-medium text-sm text-gray-600">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-1">Total</div>
                  <div className="col-span-1"></div>
                </div>
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-1 text-right font-medium">
                      ${item.total.toFixed(2)}
                    </div>
                    <div className="col-span-1 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-4 border-t">
                  <div className="w-1/3 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tax ({form.watch('tax_rate')}%):</span>
                      <span>${(calculateSubtotal() * (form.watch('tax_rate') / 100)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>
                        ${(calculateSubtotal() * (1 + form.watch('tax_rate') / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Terms & Conditions
                <HelpTooltip content="Legal terms and conditions that apply to this estimate. These protect both you and your customer." />
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Payment terms, cancellation policy, etc."
                  className="min-h-[100px]"
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
              <FormLabel>
                Notes
                <HelpTooltip content="Additional information or special instructions for this estimate." />
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes or comments"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Status
                <HelpTooltip content="The current status of this estimate. Draft estimates are not visible to customers until sent." />
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Estimate' : 'Create Estimate'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EstimateForm;
