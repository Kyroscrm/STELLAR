
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCustomers } from '@/hooks/useCustomers';
import { useJobs } from '@/hooks/useJobs';
import { useEstimates } from '@/hooks/useEstimates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, FileText, DollarSign } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  customer_id: z.string().min(1, 'Customer is required'),
  job_id: z.string().optional(),
  estimate_id: z.string().optional(),
  due_date: z.date().optional(),
  tax_rate: z.number().min(0).max(1).default(0),
  payment_terms: z.string().optional(),
  notes: z.string().optional()
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  estimateId?: string; // Pre-populate from estimate
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  estimateId 
}) => {
  const { customers } = useCustomers();
  const { jobs } = useJobs();
  const { estimates } = useEstimates();
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_number: `INV-${Date.now()}`,
      tax_rate: 0.08,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  });

  useEffect(() => {
    if (estimateId) {
      const estimate = estimates.find(e => e.id === estimateId);
      if (estimate) {
        setSelectedEstimate(estimate);
        form.setValue('title', estimate.title);
        form.setValue('description', estimate.description || '');
        form.setValue('customer_id', estimate.customer_id || '');
        form.setValue('job_id', estimate.job_id || '');
        form.setValue('estimate_id', estimate.id);
        form.setValue('tax_rate', estimate.tax_rate || 0.08);
      }
    }
  }, [estimateId, estimates, form]);

  const handleSubmit = async (data: InvoiceFormData) => {
    await onSubmit(data);
  };

  const handleEstimateSelect = (estimateId: string) => {
    if (estimateId === 'none') {
      setSelectedEstimate(null);
      form.setValue('estimate_id', undefined);
      return;
    }
    
    const estimate = estimates.find(e => e.id === estimateId);
    if (estimate) {
      setSelectedEstimate(estimate);
      form.setValue('title', estimate.title);
      form.setValue('description', estimate.description || '');
      form.setValue('customer_id', estimate.customer_id || '');
      form.setValue('job_id', estimate.job_id || '');
      form.setValue('estimate_id', estimate.id);
      form.setValue('tax_rate', estimate.tax_rate || 0.08);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invoice_number">Invoice Number</Label>
          <Input
            id="invoice_number"
            {...form.register('invoice_number')}
            className="mt-1"
          />
          {form.formState.errors.invoice_number && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.invoice_number.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="due_date">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal mt-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch('due_date') ? (
                  format(form.watch('due_date'), 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.watch('due_date')}
                onSelect={(date) => form.setValue('due_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...form.register('title')}
          className="mt-1"
        />
        {form.formState.errors.title && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_id">Customer</Label>
          <Select
            value={form.watch('customer_id')}
            onValueChange={(value) => form.setValue('customer_id', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.customer_id && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.customer_id.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="job_id">Job (Optional)</Label>
          <Select
            value={form.watch('job_id') || 'none'}
            onValueChange={(value) => form.setValue('job_id', value === 'none' ? undefined : value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Job</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!estimateId && (
        <div>
          <Label htmlFor="estimate_id">Create from Estimate (Optional)</Label>
          <Select
            value={form.watch('estimate_id') || 'none'}
            onValueChange={handleEstimateSelect}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select estimate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Estimate</SelectItem>
              {estimates.filter(e => e.status === 'approved').map((estimate) => (
                <SelectItem key={estimate.id} value={estimate.id}>
                  {estimate.estimate_number} - {estimate.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedEstimate && (
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <FileText className="h-4 w-4 mr-2" />
              Estimate Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Estimate:</span> {selectedEstimate.estimate_number}
              </div>
              <div>
                <span className="font-medium">Total:</span> ${selectedEstimate.total_amount?.toFixed(2)}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Description:</span> {selectedEstimate.description}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tax_rate">Tax Rate</Label>
          <div className="relative mt-1">
            <Input
              id="tax_rate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              {...form.register('tax_rate', { valueAsNumber: true })}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>

        <div>
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Select
            value={form.watch('payment_terms') || 'none'}
            onValueChange={(value) => form.setValue('payment_terms', value === 'none' ? undefined : value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Terms</SelectItem>
              <SelectItem value="net_15">Net 15</SelectItem>
              <SelectItem value="net_30">Net 30</SelectItem>
              <SelectItem value="net_60">Net 60</SelectItem>
              <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...form.register('notes')}
          className="mt-1"
          rows={3}
          placeholder="Additional notes or terms..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;
