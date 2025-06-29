import EstimateForm from '@/components/EstimateForm';
import EstimateLineItemsDisplay from '@/components/EstimateLineItemsDisplay';
import NewEstimateDialog from '@/components/NewEstimateDialog';
import NewTemplateDialog from '@/components/NewTemplateDialog';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import SkeletonLoader from '@/components/ui/skeleton-loader';
import ErrorMessage from '@/components/ui/error-message';
import { useCustomers } from '@/hooks/useCustomers';
import { useEstimates, EstimateWithLineItems } from '@/hooks/useEstimates';
import { useEstimateTemplates } from '@/hooks/useEstimateTemplates';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import { useEstimateLineItems } from '@/hooks/useEstimateLineItems';
import {
    AlertTriangle,
    Check,
    CheckCircle,
    Download,
    Edit,
    Eye,
    FileText,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Send,
    X
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { EstimateFormData } from '@/types/app-types';
import { generateEstimatePDF } from '@/lib/pdf-generator';

// Define the LineItem interface to match what EstimateForm expects
interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const EstimatesPage = () => {
  const { estimates, loading, error, updateEstimate, deleteEstimate } = useEstimates();
  const { customers } = useCustomers();
  const { generateEstimatePDF, generating } = usePDFGeneration();
  const { templates } = useEstimateTemplates();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateWithLineItems | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEstimates = useMemo(() => {
    if (!searchTerm.trim()) return estimates;

    const searchLower = searchTerm.toLowerCase();
    return estimates.filter(estimate => {
      const title = estimate.title.toLowerCase();
      const number = estimate.estimate_number.toLowerCase();
      const description = (estimate.description || '').toLowerCase();
      const customerName = estimate.customers ?
        `${estimate.customers.first_name} ${estimate.customers.last_name}`.toLowerCase() : '';
      const notes = (estimate.notes || '').toLowerCase();

      return title.includes(searchLower) ||
             number.includes(searchLower) ||
             description.includes(searchLower) ||
             customerName.includes(searchLower) ||
             notes.includes(searchLower);
    });
  }, [estimates, searchTerm]);

  const estimateStats = {
    total: estimates.length,
    draft: estimates.filter(e => e.status === 'draft').length,
    sent: estimates.filter(e => e.status === 'sent').length,
    approved: estimates.filter(e => e.status === 'approved').length,
  };

  const handleUpdateEstimate = async (data: EstimateFormData & { lineItems: LineItem[] }) => {
    if (!selectedEstimate) return;

    setIsSubmitting(true);
    try {
      // Extract lineItems from the data before passing to updateEstimate
      const { lineItems, ...estimateData } = data;

      // Update the estimate with the formatted data
      await updateEstimate(selectedEstimate.id, estimateData);

      // Note: Line items are managed separately by the EstimateLineItemsManager component
      // when editing estimates. The form should use the EstimateLineItemsManager
      // for real-time line item updates instead of local state management.

      setIsEditModalOpen(false);
      setSelectedEstimate(null);
      toast.success('Estimate updated successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update estimate';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEstimate = async (estimateId: string) => {
    await deleteEstimate(estimateId);
    setDeleteConfirmId(null);
  };

  const handleStatusChange = async (estimateId: string, newStatus: string) => {
    await updateEstimate(estimateId, { status: newStatus as 'draft' | 'sent' | 'approved' | 'rejected' });
  };

  const handleGeneratePDF = async (estimate: EstimateWithLineItems) => {
    await generateEstimatePDF(estimate);
  };

  const handleViewEstimate = (estimate: EstimateWithLineItems) => {
    setSelectedEstimate(estimate);
    setIsViewModalOpen(true);
  };

  const handleEditEstimate = (estimate: EstimateWithLineItems) => {
    setSelectedEstimate(estimate);
    setIsEditModalOpen(true);
    setIsViewModalOpen(false);
  };

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage
          message={error.message || "Failed to load estimates. Please try again."}
          title="Error Loading Estimates"
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
          <h1 className="text-3xl font-bold">Estimates</h1>
          <p className="text-gray-600">Create and manage project estimates</p>
        </div>
        <div className="flex gap-2">
          <NewTemplateDialog />
          <NewEstimateDialog />
        </div>
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
                  <p className="text-sm font-medium text-gray-600">Total Estimates</p>
                  <p className="text-2xl font-bold">{estimateStats.total}</p>
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
                  <p className="text-2xl font-bold">{estimateStats.draft}</p>
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
                  <p className="text-2xl font-bold">{estimateStats.sent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold">{estimateStats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search estimates by title, number, customer, or description..."
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

      {/* Estimates Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Estimate List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonLoader type="table" count={5} columns={6} />
          ) : filteredEstimates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No estimates found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.map((estimate) => (
                  <TableRow key={estimate.id}>
                    <TableCell className="font-medium">{estimate.estimate_number}</TableCell>
                    <TableCell>{estimate.title}</TableCell>
                    <TableCell>
                      {estimate.customers ? `${estimate.customers.first_name} ${estimate.customers.last_name}` : 'N/A'}
                    </TableCell>
                    <TableCell>${estimate.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          estimate.status === 'approved' ? 'bg-green-100 text-green-800' :
                          estimate.status === 'sent' ? 'bg-purple-100 text-purple-800' :
                          estimate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {estimate.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewEstimate(estimate)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditEstimate(estimate)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Estimate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGeneratePDF(estimate)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          {estimate.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(estimate.id, 'sent')}>
                              <Send className="h-4 w-4 mr-2" />
                              Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {estimate.status === 'sent' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(estimate.id, 'approved')}>
                                <Check className="h-4 w-4 mr-2" />
                                Mark as Approved
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(estimate.id, 'rejected')}>
                                <X className="h-4 w-4 mr-2" />
                                Mark as Rejected
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteConfirmId(estimate.id)}
                          >
                            Delete Estimate
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

      {/* View Estimate Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Estimate Details</DialogTitle>
            <DialogDescription>
              View complete estimate information including line items, customer details, and totals.
            </DialogDescription>
          </DialogHeader>
          {selectedEstimate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Estimate Number</p>
                  <p className="text-lg">{selectedEstimate.estimate_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge
                    className={
                      selectedEstimate.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedEstimate.status === 'sent' ? 'bg-purple-100 text-purple-800' :
                      selectedEstimate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {selectedEstimate.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Title</p>
                  <p className="text-lg">{selectedEstimate.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="text-lg">
                    {selectedEstimate.customers ?
                      `${selectedEstimate.customers.first_name} ${selectedEstimate.customers.last_name}` :
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created Date</p>
                  <p className="text-lg">
                    {new Date(selectedEstimate.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Valid Until</p>
                  <p className="text-lg">
                    {selectedEstimate.valid_until ?
                      new Date(selectedEstimate.valid_until).toLocaleDateString() :
                      'N/A'
                    }
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-lg">{selectedEstimate.description || 'No description provided.'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Line Items</p>
                <EstimateLineItemsDisplay
                  lineItems={selectedEstimate.estimate_line_items}
                  readOnly
                />
              </div>

              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-lg">{selectedEstimate.notes || 'No notes provided.'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold">${selectedEstimate.total_amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleEditEstimate(selectedEstimate)}>
                  Edit Estimate
                </Button>
                <Button onClick={() => handleGeneratePDF(selectedEstimate)}>
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Estimate Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Estimate</DialogTitle>
            <DialogDescription>
              Update the estimate details and line items below. Line items are automatically saved as you edit them.
            </DialogDescription>
          </DialogHeader>
          {selectedEstimate && (
            <EstimateForm
              initialData={selectedEstimate}
              onSubmit={handleUpdateEstimate}
              isSubmitting={isSubmitting}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the estimate and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteConfirmId && handleDeleteEstimate(deleteConfirmId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EstimatesPage;
