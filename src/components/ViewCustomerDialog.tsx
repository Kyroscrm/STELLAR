
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Mail, Phone, MapPin, Building, User } from 'lucide-react';
import { Customer } from '@/hooks/useCustomers';

interface ViewCustomerDialogProps {
  customer: Customer;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ViewCustomerDialog: React.FC<ViewCustomerDialogProps> = ({ 
  customer, 
  trigger, 
  open: controlledOpen,
  onOpenChange 
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Eye className="h-4 w-4 mr-2" />
      View Details
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                {customer.first_name} {customer.last_name}
              </h3>
              {customer.company_name && (
                <div className="flex items-center gap-2 mt-1 text-gray-600">
                  <Building className="h-4 w-4" />
                  {customer.company_name}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {(customer.address || customer.city || customer.state) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    {customer.address && <div>{customer.address}</div>}
                    {(customer.city || customer.state) && (
                      <div>{customer.city}{customer.city && customer.state && ', '}{customer.state} {customer.zip_code}</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          {(customer.emergency_contact_name || customer.emergency_contact_phone) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {customer.emergency_contact_name && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{customer.emergency_contact_name}</span>
                  </div>
                )}
                {customer.emergency_contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{customer.emergency_contact_phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <div>Created: {new Date(customer.created_at).toLocaleString()}</div>
            <div>Updated: {new Date(customer.updated_at).toLocaleString()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCustomerDialog;
