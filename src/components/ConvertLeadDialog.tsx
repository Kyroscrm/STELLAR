
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLeadConversion } from '@/hooks/useLeadConversion';
import { UserCheck, Loader2 } from 'lucide-react';

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  } | null;
  onSuccess?: () => void;
}

const ConvertLeadDialog = ({ open, onOpenChange, lead, onSuccess }: ConvertLeadDialogProps) => {
  const { convertLeadToCustomer, isConverting } = useLeadConversion();

  const handleConvert = async () => {
    if (!lead) return;

    const customer = await convertLeadToCustomer(lead.id);
    if (customer) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Convert Lead to Customer
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to convert <strong>{lead.first_name} {lead.last_name}</strong> to a customer?
            This will create a new customer record and mark the lead as won.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens when you convert:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• A new customer record will be created</li>
            <li>• The lead status will be changed to "Won"</li>
            <li>• You can then create jobs and estimates for this customer</li>
            <li>• The conversion will be logged in the activity history</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConverting}>
            Cancel
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
      </DialogContent>
    </Dialog>
  );
};

export default ConvertLeadDialog;
