import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormErrorBoundary } from '@/components/ui/form-error-boundary';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useErrorHandler, useOptimisticUpdate } from '@/hooks';
import { InvoiceWithCustomer, useInvoices } from '@/hooks/useInvoices';
import { invoiceSchema } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InvoiceFormData } from '@/types/app-types';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import InvoiceLineItemsManager from './InvoiceLineItemsManager';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
  sort_order?: number;
}

interface EditInvoiceDialogProps {
  invoice: InvoiceWithCustomer;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const EditInvoiceDialog: React.FC<EditInvoiceDialogProps> = ({
  invoice,
  trigger,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateInvoice } = useInvoices();
  const { handleError } = useErrorHandler();
  const { executeUpdate } = useOptimisticUpdate();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      title: invoice.title || '',
      description: invoice.description || '',
      invoice_number: invoice.invoice_number || '',
      customer_id: invoice.customer_id || '',
      job_id: invoice.job_id || '',
      estimate_id: invoice.estimate_id || '',
      due_date: invoice.due_date || '',
      tax_rate: invoice.tax_rate || 0,
      status: (invoice.status as InvoiceFormData['status']) || 'draft',
      payment_status: (invoice.payment_status as InvoiceFormData['payment_status']) || 'pending',
      notes: invoice.notes || '',
      payment_terms: invoice.payment_terms || '',
      line_items: [],
    },
  });

  const handleSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      await executeUpdate(
        () => {},
        () => updateInvoice(invoice.id, data),
        () => {},
        {
          successMessage: 'Invoice updated successfully',
          errorMessage: 'Failed to update invoice',
          onSuccess: () => {
            setOpen(false);
            onSuccess?.();
          }
        }
      );
    } catch (error) {
      // Error is already handled by executeUpdate
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        React.cloneElement(trigger as React.ReactElement, {
          onClick: () => setOpen(true)
        })
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      )}
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice - {invoice.invoice_number}</DialogTitle>
          <DialogDescription>
            Update the invoice details, line items, and other information below.
          </DialogDescription>
        </DialogHeader>

        <FormErrorBoundary onRetry={() => setOpen(false)}>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <InvoiceLineItemsManager invoiceId={invoice.id} />

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Update Invoice'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceDialog;
