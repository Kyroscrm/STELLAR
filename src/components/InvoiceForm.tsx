import React, { useEffect } from 'react';
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
import { invoiceSchema } from '@/lib/validation';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Invoice, InvoiceFormData } from '@/types/app-types';
import InvoiceLineItemsManager from './InvoiceLineItemsManager';

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Invoice;
  isSubmitting?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false
}) => {
  const { customers } = useCustomers();
  const { jobs } = useJobs();
  const { generateInvoiceNumber, loading: generatingNumber } = useJobNumberGenerator();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      invoice_number: initialData?.invoice_number || '',
      customer_id: initialData?.customer_id || '',
      job_id: initialData?.job_id || '',
      estimate_id: initialData?.estimate_id || '',
      due_date: initialData?.due_date || '',
      tax_rate: initialData?.tax_rate || 0,
      status: initialData?.status || 'draft',
      payment_status: (initialData?.payment_status as 'completed' | 'failed' | 'pending' | 'refunded') || 'pending',
      notes: initialData?.notes || '',
      payment_terms: initialData?.payment_terms || '',
      line_items: [],
    },
  });

  const handleGenerateInvoiceNumber = React.useCallback(async () => {
    const invoiceNumber = await generateInvoiceNumber();
    form.setValue('invoice_number', invoiceNumber);
  }, [generateInvoiceNumber, form]);

  // Auto-generate invoice number on mount if not provided
  useEffect(() => {
    if (!initialData?.invoice_number) {
      handleGenerateInvoiceNumber();
    }
  }, [initialData?.invoice_number, handleGenerateInvoiceNumber]);

  const handleSubmit = async (data: InvoiceFormData) => {
    try {
      if (!data.customer_id || data.customer_id.trim() === '') {
        toast.error('Please select a customer for this invoice');
        return;
      }
      // Only require line items for non-draft invoices (validation will be handled in the manager)
      await onSubmit(data);
    } catch (error) {
      toast.error('Failed to submit invoice: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter invoice title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="INV-001" {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateInvoiceNumber}
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
                <FormLabel>Customer *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No Customer</SelectItem>
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
                <Select
                  onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No Job</SelectItem>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
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
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
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
          name="payment_terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Terms</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter payment terms" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Invoice line items manager (persisted, DnD, etc.) */}
        <InvoiceLineItemsManager invoiceId={initialData?.id} />

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Invoice'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InvoiceForm;
