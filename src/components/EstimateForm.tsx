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
import { RefreshCw, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EstimateTemplateSelector from './EstimateTemplateSelector';

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
      status: (initialData?.status as any) || 'draft',
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

  const handleTemplateSelect = (template: any) => {
    // Apply template data to form
    form.setValue('title', template.name);
    form.setValue('tax_rate', template.tax_rate);
    form.setValue('terms', template.terms || '');
    form.setValue('notes', template.notes || '');
    
    // Apply template line items
    const templateLineItems = template.line_items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price
    }));
    
    setLineItems(templateLineItems);
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
      console.error('Error submitting estimate:', error);
    }
  };

  if (showTemplateSelector) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplateSelector(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Form
          </Button>
        </div>
        <EstimateTemplateSelector
          onSelectTemplate={handleTemplateSelect}
          onCreateNew={() => setShowTemplateSelector(false)}
        />
      </div>
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
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
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
                <FormLabel>Estimate Number *</FormLabel>
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
                <FormLabel>Customer</FormLabel>
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
                <FormLabel>Job (Optional)</FormLabel>
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

        {/* Line Items Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Line Items
              <Button type="button" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lineItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No line items yet. Click "Add Item" to get started.</p>
              </div>
            ) : (
              <>
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 pb-2 border-b">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-1">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Line Items */}
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-1 text-right font-medium">
                      ${item.total.toFixed(2)}
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="valid_until"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Until</FormLabel>
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
                <FormLabel>Tax Rate (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) / 100)}
                    value={field.value ? (field.value * 100).toString() : ''}
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
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
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
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms & Conditions</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter terms and conditions" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Estimate'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EstimateForm;
