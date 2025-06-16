import React, { useState } from 'react';
import { useEstimates } from '@/hooks/useEstimates';
import { useCustomers } from '@/hooks/useCustomers';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import EstimateForm from '@/components/EstimateForm';
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
  X
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

const EstimatesPage = () => {
  const { estimates, loading, error, createEstimate, updateEstimate, deleteEstimate } = useEstimates();
  const { customers } = useCustomers();
  const { generateEstimatePDF, generating } = usePDFGeneration();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEstimates = estimates.filter(estimate => 
    estimate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.estimate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (estimate.customers && `${estimate.customers.first_name} ${estimate.customers.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const estimateStats = {
    total: estimates.length,
    draft: estimates.filter(e => e.status === 'draft').length,
    sent: estimates.filter(e => e.status === 'sent').length,
    approved: estimates.filter(e => e.status === 'approved').length,
  };

  const handleCreateEstimate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createEstimate(data);
      setIsCreateModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEstimate = async (estimateId: string) => {
    await deleteEstimate(estimateId);
    setDeleteConfirmId(null);
  };

  const handleStatusChange = async (estimateId: string, newStatus: string) => {
    await updateEstimate(estimateId, { status: newStatus as any });
  };

  const handleGeneratePDF = async (estimate: any) => {
    const estimateData = {
      ...estimate,
      estimate_line_items: estimate.estimate_line_items || []
    };
    await generateEstimatePDF(estimateData);
  };

  const handleViewEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
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
        <p className="mt-4 text-lg">Error loading estimates: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estimates</h1>
          <p className="text-gray-600">Create and manage estimates with line items</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Estimate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Estimate</DialogTitle>
            </DialogHeader>
            <EstimateForm
              onSubmit={handleCreateEstimate}
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

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search estimates by title, number, or customer..." 
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

      {/* Estimates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estimate List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell className="font-medium">{estimate.estimate_number}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleViewEstimate(estimate)}
                      className="hover:underline text-left"
                    >
                      {estimate.title}
                    </button>
                  </TableCell>
                  <TableCell>
                    {estimate.customers ? 
                      `${estimate.customers.first_name} ${estimate.customers.last_name}` : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      estimate.status === 'approved' ? 'default' :
                      estimate.status === 'sent' ? 'secondary' :
                      estimate.status === 'rejected' ? 'destructive' :
                      'outline'
                    } className="capitalize">
                      {estimate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${(estimate.total_amount || 0).toFixed(2)}</TableCell>
                  <TableCell>{estimate.valid_until ? new Date(estimate.valid_until).toLocaleDateString() : 'N/A'}</TableCell>
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
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleGeneratePDF(estimate)}
                          disabled={generating}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(estimate.id, 'sent')}>
                          <Send className="h-4 w-4 mr-2" />
                          Mark as Sent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(estimate.id, 'approved')}>
                          <Check className="h-4 w-4 mr-2" />
                          Mark as Approved
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setDeleteConfirmId(estimate.id)}
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
          
          {filteredEstimates.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">No estimates found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Estimate Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Estimate Details</DialogTitle>
          </DialogHeader>
          {selectedEstimate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Estimate #{selectedEstimate.estimate_number}</h3>
                  <p className="text-gray-600">{selectedEstimate.title}</p>
                </div>
                <div className="text-right">
                  <Badge className="capitalize">{selectedEstimate.status}</Badge>
                </div>
              </div>
              <div className="border-t pt-4">
                <p><strong>Customer:</strong> {selectedEstimate.customers ? `${selectedEstimate.customers.first_name} ${selectedEstimate.customers.last_name}` : 'N/A'}</p>
                <p><strong>Valid Until:</strong> {selectedEstimate.valid_until || 'N/A'}</p>
                <p><strong>Total:</strong> ${(selectedEstimate.total_amount || 0).toFixed(2)}</p>
              </div>
              {selectedEstimate.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="text-gray-600">{selectedEstimate.description}</p>
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
            <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this estimate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteEstimate(deleteConfirmId)}
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

export default EstimatesPage;
