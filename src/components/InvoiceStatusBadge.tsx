
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InvoiceStatusBadgeProps {
  status: string;
  dueDate?: string;
  className?: string;
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ 
  status, 
  dueDate, 
  className 
}) => {
  // Auto-detect overdue status
  const isOverdue = dueDate && status !== 'paid' && new Date(dueDate) < new Date();
  const displayStatus = isOverdue ? 'overdue' : status;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-700 border-gray-300',
          label: 'Draft'
        };
      case 'sent':
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-50 text-blue-700 border-blue-300',
          label: 'Sent'
        };
      case 'paid':
        return {
          variant: 'default' as const,
          className: 'bg-green-50 text-green-700 border-green-300',
          label: 'Paid'
        };
      case 'overdue':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-50 text-red-700 border-red-300',
          label: 'Overdue'
        };
      case 'cancelled':
        return {
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-500 border-gray-300',
          label: 'Cancelled'
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-700 border-gray-300',
          label: status
        };
    }
  };

  const config = getStatusConfig(displayStatus);

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
      title={dueDate ? `Due: ${new Date(dueDate).toLocaleDateString()}` : undefined}
    >
      {config.label}
    </Badge>
  );
};

export default InvoiceStatusBadge;
