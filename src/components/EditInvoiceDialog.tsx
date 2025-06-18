import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceSchema, InvoiceFormData } from '@/lib/validation';
import { useInvoices, InvoiceWithCustomer } from '@/hooks/useInvoices';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { FormErrorBoundary } from '@/components/ui/form-error-boundary';
import { useErrorHandler, useOptimisticUpdate } from '@/hooks';

interface EditInvoiceDialogProps {
  invoice: InvoiceWithCustomer;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const EditInvoiceDialog: React.FC<EditInvoiceDialogProps> = ({ 
  invoice, 
  trigger,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
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
      status: (invoice.status as any) || 'draft',
      notes: invoice.notes || '',
      payment_terms: invoice.payment_terms || '',
    },
  });

  // Initialize line items from invoice data
  useEffect(() => {
    if (invoice.invoice_line_items && invoice.invoice_line_items.length > 0) {
      const items = invoice.invoice_line_items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.total)
      }));
      setLineItems(items);
    }
  }, [invoice.invoice_line_items]);

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

  const handleSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      // Validate line items
      if (lineItems.length === 0) {
        toast.error('Please add at least one line item to the invoice');
        return;
      }

      console.log('Updating invoice with data:', data);
      
      await executeUpdate(
        () => {
          // Optimistic update would go here if we had local state
        },
        () => updateInvoice(invoice.id, data),
        () => {
          // Rollback would go here if we had local state
        },
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
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      )}
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice - {invoice.invoice_number}</DialogTitle>
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
