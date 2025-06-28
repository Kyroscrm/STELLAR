import React, { useState } from 'react';
import { useInvoices, InvoiceWithCustomer, InvoiceLineItem } from '@/hooks/useInvoices';
import { useCustomers } from '@/hooks/useCustomers';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import InvoiceForm from '@/components/InvoiceForm';
import EditInvoiceDialog from '@/components/EditInvoiceDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SkeletonLoader from '@/components/ui/skeleton-loader';
import ErrorMessage from '@/components/ui/error-message';
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
  DialogDescription,
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
import { InvoiceFormData } from '@/types/app-types';

const InvoicesPage = () => {
  const { invoices, loading, error, addInvoice, updateInvoice, deleteInvoice } = useInvoices();
  const { customers } = useCustomers();
  const { generateInvoicePDF, generating } = usePDFGeneration();
  const { handleError } = useErrorHandler();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithCustomer | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.customers && `${invoice.customers.first_name} ${invoice.customers.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const invoiceStats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
  };

  const handleCreateInvoice = async (data: InvoiceFormData) => {
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

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceFormData['status']) => {
    try {
      await updateInvoice(invoiceId, { status: newStatus });
      toast.success('Invoice status updated');
    } catch (error) {
      handleError(error, {
        title: 'Failed to update invoice status',
        retryAction: () => handleStatusChange(invoiceId, newStatus)
      });
    }
  };

  const handleGeneratePDF = async (invoice: InvoiceWithCustomer) => {
    try {
      await generateInvoicePDF(invoice);
    } catch (error) {
      handleError(error, {
        title: 'Failed to generate PDF',
        retryAction: () => handleGeneratePDF(invoice)
      });
    }
  };

  const handleViewInvoice = (invoice: InvoiceWithCustomer) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage
          message={error.message || "Failed to load invoices. Please try again."}
          title="Error Loading Invoices"
          onRetry={() => window.location.reload()}
          severity="error"
        />
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
              <DialogDescription>
                Fill out the invoice details, add line items, and set the status for your new invoice.
              </DialogDescription>
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

      {/* Stats Cards */}
      {loading ? (
        <SkeletonLoader type="stats" count={4} />
      ) : (
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
      )}

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
          {loading ? (
            <SkeletonLoader type="table" count={5} columns={6} />
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No invoices found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.title}</TableCell>
                    <TableCell>
                      {invoice.customers ?
                        `${invoice.customers.first_name} ${invoice.customers.last_name}` :
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>${invoice.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'sent' ? 'bg-purple-100 text-purple-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.due_date ?
                        new Date(invoice.due_date).toLocaleDateString() :
                        'N/A'
                      }
                    </TableCell>
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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <EditInvoiceDialog
                              invoice={invoice}
                              trigger={<span className="w-full cursor-pointer flex items-center">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Invoice
                              </span>}
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGeneratePDF(invoice)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'sent')}>
                              <Send className="h-4 w-4 mr-2" />
                              Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'sent' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'paid')}>
                              <Check className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteConfirmId(invoice.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Delete Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Invoice Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View complete invoice information including line items, customer details, and payment status.
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                  <p className="text-lg">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge
                    className={
                      selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      selectedInvoice.status === 'sent' ? 'bg-purple-100 text-purple-800' :
                      selectedInvoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {selectedInvoice.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Title</p>
                  <p className="text-lg">{selectedInvoice.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="text-lg">
                    {selectedInvoice.customers ?
                      `${selectedInvoice.customers.first_name} ${selectedInvoice.customers.last_name}` :
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created Date</p>
                  <p className="text-lg">
                    {new Date(selectedInvoice.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="text-lg">
                    {selectedInvoice.due_date ?
                      new Date(selectedInvoice.due_date).toLocaleDateString() :
                      'N/A'
                    }
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-lg">{selectedInvoice.description || 'No description provided.'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Line Items</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.invoice_line_items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unit_price.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${item.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-lg">{selectedInvoice.notes || 'No notes provided.'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold">${selectedInvoice.total_amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleGeneratePDF(selectedInvoice)}>
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteConfirmId && handleDeleteInvoice(deleteConfirmId)}
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
