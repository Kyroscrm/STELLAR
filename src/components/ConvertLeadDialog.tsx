
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLeadConversion } from '@/hooks/useLeadConversion';
import { UserCheck, Loader2, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    estimated_value?: number;
    source?: string;
  } | null;
  onSuccess?: () => void;
}

const ConvertLeadDialog = ({ open, onOpenChange, lead, onSuccess }: ConvertLeadDialogProps) => {
  const { convertLeadToCustomer, isConverting } = useLeadConversion();
  const [step, setStep] = useState<'confirm' | 'details' | 'success'>('confirm');
  const [customerNotes, setCustomerNotes] = useState('');
  const [conversionReason, setConversionReason] = useState('');

  const handleConfirm = () => {
    setStep('details');
  };

  const handleConvert = async () => {
    if (!lead) return;

    const customer = await convertLeadToCustomer(lead.id, {
      notes: customerNotes,
      conversion_reason: conversionReason
    });
    
    if (customer) {
      setStep('success');
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        // Reset state
        setStep('confirm');
        setCustomerNotes('');
        setConversionReason('');
      }, 2000);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('confirm');
    setCustomerNotes('');
    setConversionReason('');
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Convert Lead to Customer
              </DialogTitle>
              <DialogDescription>
                You're about to convert <strong>{lead.first_name} {lead.last_name}</strong> to a customer.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-blue-900">Lead Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Contact:</span>
                    <span className="text-blue-900">{lead.email || lead.phone || 'N/A'}</span>
                  </div>
                  {lead.estimated_value && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Est. Value:</span>
                      <span className="text-blue-900">${lead.estimated_value.toLocaleString()}</span>
                    </div>
                  )}
                  {lead.source && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Source:</span>
                      <Badge variant="outline" className="capitalize">{lead.source}</Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">What happens next:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Customer record will be created</li>
                  <li>• Lead status changes to "Won"</li>
                  <li>• You can create jobs and estimates</li>
                  <li>• Conversion tracked in analytics</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Continue Conversion
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'details' && (
          <>
            <DialogHeader>
              <DialogTitle>Conversion Details</DialogTitle>
              <DialogDescription>
                Add additional information for the new customer record.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="conversion-reason">Conversion Reason</Label>
                <Input
                  id="conversion-reason"
                  placeholder="e.g., Ready to proceed with project"
                  value={conversionReason}
                  onChange={(e) => setConversionReason(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="customer-notes">Customer Notes</Label>
                <Textarea
                  id="customer-notes"
                  placeholder="Add any important notes about this customer..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('confirm')}>
                Back
              </Button>
              <Button onClick={handleConvert} disabled={isConverting}>
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  'Convert to Customer'
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'success' && (
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Conversion Successful!
            </h3>
            <p className="text-green-700">
              {lead.first_name} {lead.last_name} is now a customer.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConvertLeadDialog;
