
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInvoices } from '@/hooks/useInvoices';
import { useCustomers } from '@/hooks/useCustomers';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import { useRealtimeInvoices } from '@/hooks/useRealtimeInvoices';
import { createStripeCheckoutSession, getPaymentStatusBadgeVariant, getPaymentStatusLabel } from '@/utils/stripe';
import InvoiceForm from '@/components/InvoiceForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  FileText,
  DollarSign,
  CheckCircle,
  Eye,
  AlertTriangle,
  Download,
  Send,
  Check,
  X,
  CreditCard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const InvoicesPage = () => {
  const { invoices, loading, error, addInvoice, updateInvoice, deleteInvoice, markInvoiceAsPaid, fetchInvoices } = useInvoices();
  const { customers } = useCustomers();
  const { generateInvoicePDF, generating } = usePDFGeneration();
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState<string | null>(null);

  // Handle payment success/cancellation from URL params
  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    
    if (payment === 'success' && sessionId) {
      toast.success('Payment completed successfully!');
      // You could also verify the payment status here if needed
    } else if (payment === 'cancelled') {
      toast.error('Payment was cancelled');
    }
  }, [searchParams]);

  const filteredInvoices = invoices.filter(invoice => 
    invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.customers && `${invoice.customers.first_name} ${invoice.customers.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const invoiceStats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.payment_status === 'paid').length,
  };

  const handleCreateInvoice = async (data: any) => {
    setIsSubmitting(true);
    try {
      await addInvoice(data);
      setIsCreateModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    await deleteInvoice(invoiceId);
    setDeleteConfirmId(null);
  };

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    await updateInvoice(invoiceId, { status: newStatus as any });
  };

  const handleGeneratePDF = async (invoice: any) => {
    const invoiceData = {
      ...invoice,
      invoice_line_items: invoice.invoice_line_items || []
    };
    await generateInvoicePDF(invoiceData);
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handlePayNow = async (invoiceId: string) => {
    setPaymentProcessing(invoiceId);
    try {
      const checkoutUrl = await createStripeCheckoutSession({ invoiceId });
      if (checkoutUrl) {
        // Open Stripe checkout in a new tab
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
    } finally {
      setPaymentProcessing(null);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    await markInvoiceAsPaid(invoiceId);
  };

  // Add realtime updates
  useRealtimeInvoices((updatedInvoice) => {
    // Refresh invoices when payment status changes
    fetchInvoices();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <AlertTriangle className="mx-auto h-12 w-12" />
        <p className="mt-4 text-lg">Error loading invoices: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600">Create and manage invoices with line items</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm
              onSubmit={handleCreateInvoice}
              onCancel={() => setIsCreateModalOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{invoiceStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold">{invoiceStats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold">{invoiceStats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold">{invoiceStats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search invoices by title, number, or customer..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleViewInvoice(invoice)}
                      className="hover:underline text-left"
                    >
                      {invoice.title}
                    </button>
                  </TableCell>
                  <TableCell>
                    {invoice.customers ? 
                      `${invoice.customers.first_name} ${invoice.customers.last_name}` : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      invoice.status === 'paid' ? 'default' :
                      invoice.status === 'sent' ? 'secondary' :
                      invoice.status === 'overdue' ? 'destructive' :
                      'outline'
                    } className="capitalize">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentStatusBadgeVariant(invoice.payment_status || 'unpaid')}>
                      {getPaymentStatusLabel(invoice.payment_status || 'unpaid')}
                    </Badge>
                  </TableCell>
                  <TableCell>${(invoice.total_amount || 0).toFixed(2)}</TableCell>
                  <TableCell>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleGeneratePDF(invoice)}
                          disabled={generating}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {invoice.payment_status !== 'paid' && (
                          <DropdownMenuItem 
                            onClick={() => handlePayNow(invoice.id)}
                            disabled={paymentProcessing === invoice.id}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {paymentProcessing === invoice.id ? 'Processing...' : 'Pay Now'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'sent')}>
                          <Send className="h-4 w-4 mr-2" />
                          Mark as Sent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Mark as Paid
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setDeleteConfirmId(invoice.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">No invoices found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Invoice #{selectedInvoice.invoice_number}</h3>
                  <p className="text-gray-600">{selectedInvoice.title}</p>
                </div>
                <div className="text-right space-y-2">
                  <Badge className="capitalize">{selectedInvoice.status}</Badge>
                  <div>
                    <Badge variant={getPaymentStatusBadgeVariant(selectedInvoice.payment_status || 'unpaid')}>
                      {getPaymentStatusLabel(selectedInvoice.payment_status || 'unpaid')}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <p><strong>Customer:</strong> {selectedInvoice.customers ? `${selectedInvoice.customers.first_name} ${selectedInvoice.customers.last_name}` : 'N/A'}</p>
                <p><strong>Due Date:</strong> {selectedInvoice.due_date || 'N/A'}</p>
                <p><strong>Total:</strong> ${(selectedInvoice.total_amount || 0).toFixed(2)}</p>
                {selectedInvoice.paid_at && (
                  <p><strong>Paid On:</strong> {new Date(selectedInvoice.paid_at).toLocaleDateString()}</p>
                )}
              </div>
              {selectedInvoice.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="text-gray-600">{selectedInvoice.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteInvoice(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvoicesPage;
