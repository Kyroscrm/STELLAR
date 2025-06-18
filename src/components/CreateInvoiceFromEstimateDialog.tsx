
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInvoices } from '@/hooks/useInvoices';
import { useJobNumberGenerator } from '@/hooks/useJobNumberGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateInvoiceFromEstimateDialogProps {
  estimate: any;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const CreateInvoiceFromEstimateDialog: React.FC<CreateInvoiceFromEstimateDialogProps> = ({
  estimate,
  trigger,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const { addInvoice } = useInvoices();
  const { generateInvoiceNumber } = useJobNumberGenerator();

  const handleGenerateNumber = async () => {
    const number = await generateInvoiceNumber();
    setInvoiceNumber(number);
  };

  const handleCreateInvoice = async () => {
    if (!invoiceNumber) {
      toast.error('Please generate an invoice number first');
      return;
    }

    setIsSubmitting(true);
    try {
      // Map estimate data to invoice format
      const invoiceData = {
        title: estimate.title,
        description: estimate.description || '',
        invoice_number: invoiceNumber,
        customer_id: estimate.customer_id,
        job_id: estimate.job_id,
        estimate_id: estimate.id,
        tax_rate: estimate.tax_rate || 0,
        status: 'draft' as const,
        notes: estimate.notes || '',
        payment_terms: 'Net 30 days',
        lineItems: estimate.estimate_line_items?.map((item: any) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price)
        })) || []
      };

      console.log('Creating invoice from estimate:', invoiceData);
      
      const result = await addInvoice(invoiceData);
      if (result) {
        toast.success('Invoice created successfully from estimate');
        setOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error creating invoice from estimate:', error);
      toast.error('Failed to create invoice from estimate');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate invoice number when dialog opens
  React.useEffect(() => {
    if (open && !invoiceNumber) {
      handleGenerateNumber();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Invoice from Estimate</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estimate Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Estimate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Number:</span>
                  <span className="ml-2 font-medium">{estimate.estimate_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <span className="ml-2 font-medium">${(estimate.total_amount || 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Customer:</span>
                  <span className="ml-2 font-medium">
                    {estimate.customers ? 
                      `${estimate.customers.first_name} ${estimate.customers.last_name}` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Line Items:</span>
                  <span className="ml-2 font-medium">{estimate.estimate_line_items?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Number</label>
            <div className="flex gap-2">
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-001"
              />
              <Button variant="outline" onClick={handleGenerateNumber}>
                Generate
              </Button>
            </div>
          </div>

          {/* Conversion Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                What will be copied to the invoice:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-600" />
                <span>Title and description</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-600" />
                <span>Customer information</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-600" />
                <span>All line items with quantities and prices</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-600" />
                <span>Tax rate and notes</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                <span>Invoice status will be set to "Draft"</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateInvoice} 
              disabled={isSubmitting || !invoiceNumber}
            >
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceFromEstimateDialog;
