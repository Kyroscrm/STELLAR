import React, { useState } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { useCustomers } from '@/hooks/useCustomers';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import InvoiceForm from '@/components/InvoiceForm';
import EditInvoiceDialog from '@/components/EditInvoiceDialog';
import InvoiceStatusBadge from '@/components/InvoiceStatusBadge';
import InvoiceFilters from '@/components/InvoiceFilters';
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
  Edit
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { LoadingWrapper } from '@/components/LoadingWrapper';
import { FormErrorBoundary } from '@/components/FormErrorBoundary';
import { DataTable } from '@/components/DataTable';
import { toast } from 'sonner';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const InvoicesPage = () => {
  const { invoices, loading, error, addInvoice, updateInvoice, deleteInvoice } = useInvoices();
  const { customers } = useCustomers();
  const { generateInvoicePDF, generating } = usePDFGeneration();
  const { handleError } = useErrorHandler();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [amountRange, setAmountRange] = useState({ min: 0, max: 10000 });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced filtering logic
  const filteredInvoices = invoices.filter(invoice => {
    // Text search
    const matchesSearch = !searchTerm || (
      invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customers && `${invoice.customers.first_name} ${invoice.customers.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Status filter (with auto-overdue detection)
    const isOverdue = invoice.due_date && invoice.status !== 'paid' && new Date(invoice.due_date) < new Date();
    const actualStatus = isOverdue ? 'overdue' : invoice.status;
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(actualStatus);

    // Date range filter
    const invoiceDate = new Date(invoice.created_at);
    const matchesDateRange = (!dateRange.from || invoiceDate >= dateRange.from) &&
                            (!dateRange.to || invoiceDate <= dateRange.to);

    // Amount range filter
    const amount = invoice.total_amount || 0;
    const matchesAmount = amount >= amountRange.min && amount <= amountRange.max;

    return matchesSearch && matchesStatus && matchesDateRange && matchesAmount;
  });
  
  // Updated stats with overdue detection
  const invoiceStats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => {
      const isOverdue = i.due_date && i.status !== 'paid' && new Date(i.due_date) < new Date();
      return isOverdue;
    }).length
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setDateRange({});
    setAmountRange({ min: 0, max: 10000 });
  };

  const handleCreateInvoice = async (data: any) => {
    setIsSubmitting(true);
    try {
      await addInvoice(data);
      setIsCreateModalOpen(false);
      toast.success('Invoice created successfully');
    } catch (error) {
      handleError(error, { 
        title: 'Failed to create invoice',
        retryAction: () => handleCreateInvoice(data)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteInvoice(invoiceId);
      setDeleteConfirmId(null);
      toast.success('Invoice deleted successfully');
    } catch (error) {
      handleError(error, { 
        title: 'Failed to delete invoice',
        retryAction: () => handleDeleteInvoice(invoiceId)
      });
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      await updateInvoice(invoiceId, { status: newStatus as any });
      toast.success('Invoice status updated');
    } catch (error) {
      handleError(error, { 
        title: 'Failed to update invoice status',
        retryAction: () => handleStatusChange(invoiceId, newStatus)
      });
    }
  };

  const handleGeneratePDF = async (invoice: any) => {
    try {
      const invoiceData = {
        ...invoice,
        invoice_line_items: invoice.invoice_line_items || []
      };
      await generateInvoicePDF(invoiceData);
    } catch (error) {
      handleError(error, { 
        title: 'Failed to generate PDF',
        retryAction: () => handleGeneratePDF(invoice)
      });
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

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
            <FormErrorBoundary onRetry={() => setIsCreateModalOpen(false)}>
              <InvoiceForm
                onSubmit={handleCreateInvoice}
                onCancel={() => setIsCreateModalOpen(false)}
                isSubmitting={isSubmitting}
              />
            </FormErrorBoundary>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Eye className="h-8 w-8 text-gray-500" />
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
              <Send className="h-8 w-8 text-blue-600" />
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">{invoiceStats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <InvoiceFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        amountRange={amountRange}
        onAmountRangeChange={setAmountRange}
        onClearFilters={handleClearFilters}
      />

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List ({filteredInvoices.length} of {invoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredInvoices}
            loading={loading}
            error={error}
            emptyStateEntity="invoices"
            onCreateNew={() => setIsCreateModalOpen(true)}
            columns={[
              { header: 'Number', accessorKey: 'invoice_number' },
              { 
                header: 'Title', 
                accessorFn: (invoice) => (
                  <button
                    onClick={() => handleViewInvoice(invoice)}
                    className="hover:underline text-left"
                  >
                    {invoice.title}
                  </button>
                )
              },
              { 
                header: 'Customer', 
                accessorFn: (invoice) => invoice.customers ? 
                  `${invoice.customers.first_name} ${invoice.customers.last_name}` : 
                  'N/A'
              },
              { 
                header: 'Status', 
                accessorFn: (invoice) => (
                  <InvoiceStatusBadge 
                    status={invoice.status} 
                    dueDate={invoice.due_date}
                  />
                )
              },
              { 
                header: 'Total', 
                accessorFn: (invoice) => `$${(invoice.total_amount || 0).toFixed(2)}`
              },
              { 
                header: 'Due Date', 
                accessorFn: (invoice) => invoice.due_date ? 
                  new Date(invoice.due_date).toLocaleDateString() : 'N/A'
              },
              { 
                header: 'Actions', 
                accessorFn: (invoice) => (
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
                      <EditInvoiceDialog 
                        invoice={invoice} 
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        } 
                      />
                      <DropdownMenuItem 
                        onClick={() => handleGeneratePDF(invoice)}
                        disabled={generating}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'sent')}>
                        <Send className="h-4 w-4 mr-2" />
                        Mark as Sent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'paid')}>
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setDeleteConfirmId(invoice.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
                className: "text-right"
              }
            ]}
          />
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
                <div className="text-right">
                  <InvoiceStatusBadge 
                    status={selectedInvoice.status} 
                    dueDate={selectedInvoice.due_date}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p><strong>Customer:</strong> {selectedInvoice.customers ? `${selectedInvoice.customers.first_name} ${selectedInvoice.customers.last_name}` : 'N/A'}</p>
                <p><strong>Due Date:</strong> {selectedInvoice.due_date || 'N/A'}</p>
                <p><strong>Total:</strong> ${(selectedInvoice.total_amount || 0).toFixed(2)}</p>
              </div>
              {selectedInvoice.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="text-gray-600">{selectedInvoice.description}</p>
                </div>
              )}
              
              {/* Display line items */}
              {selectedInvoice.invoice_line_items && selectedInvoice.invoice_line_items.length > 0 && (
                <div>
                  <strong>Line Items:</strong>
                  <div className="mt-2 space-y-2">
                    {selectedInvoice.invoice_line_items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
                        </div>
                        <p className="font-medium">${Number(item.total).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <EditInvoiceDialog 
                    invoice={selectedInvoice} 
                    trigger={
                      <Button>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Invoice
                      </Button>
                    } 
                    onSuccess={() => setIsViewModalOpen(false)}
                  />
                  <Button onClick={() => handleGeneratePDF(selectedInvoice)} disabled={generating}>
                    <Download className="h-4 w-4 mr-2" />
                    {generating ? 'Generating...' : 'Download PDF'}
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-lg"><strong>Total: ${(selectedInvoice.total_amount || 0).toFixed(2)}</strong></p>
                </div>
              </div>
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
