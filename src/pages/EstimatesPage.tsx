
import React, { useState, useMemo } from 'react';
import { useEstimates } from '@/hooks/useEstimates';
import { useCustomers } from '@/hooks/useCustomers';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import { supabase } from '@/integrations/supabase/client';
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
import EstimateForm from '@/components/EstimateForm';
import EstimateLineItemsDisplay from '@/components/EstimateLineItemsDisplay';
import { toast } from 'sonner';

const EstimatesPage = () => {
  const { estimates, loading, createEstimate, updateEstimate, deleteEstimate } = useEstimates();
  const { customers } = useCustomers();
  const { generateEstimatePDF, generating } = usePDFGeneration();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
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

  const addLineItemsToEstimate = async (estimateId: string, lineItems: any[]) => {
    try {
      for (const item of lineItems) {
        if (item.description.trim()) {
          const total = Number(item.quantity) * Number(item.unit_price);
          
          const { error } = await supabase
            .from('estimate_line_items')
            .insert({
              estimate_id: estimateId,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total,
              sort_order: 0
            });

          if (error) {
            console.error('Error adding line item:', error);
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Error adding line items:', error);
      toast.error('Failed to add some line items');
    }
  };

  const handleCreateEstimate = async (data: any) => {
    setIsSubmitting(true);
    try {
      const estimateData = {
        title: data.title,
        description: data.description || '',
        estimate_number: data.estimate_number,
        customer_id: data.customer_id || null,
        job_id: data.job_id || null,
        valid_until: data.valid_until || null,
        tax_rate: data.tax_rate || 0,
        status: data.status || 'draft',
        notes: data.notes || '',
        terms: data.terms || '',
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0
      };

      const result = await createEstimate(estimateData);
      
      if (result && data.lineItems && data.lineItems.length > 0) {
        await addLineItemsToEstimate(result.id, data.lineItems);
      }
      
      if (result) {
        setIsCreateModalOpen(false);
        toast.success('Estimate created successfully');
      }
    } catch (error) {
      console.error('Error creating estimate:', error);
      toast.error('Failed to create estimate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEstimate = async (data: any) => {
    if (!selectedEstimate) return;
    
    setIsSubmitting(true);
    try {
      await updateEstimate(selectedEstimate.id, data);
      setIsEditModalOpen(false);
      setSelectedEstimate(null);
      toast.success('Estimate updated successfully');
    } catch (error) {
      console.error('Error updating estimate:', error);
      toast.error('Failed to update estimate');
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

  const handleEditEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsEditModalOpen(true);
    setIsViewModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estimates</h1>
          <p className="text-gray-600">Create and manage project estimates with line items</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Estimate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
                      estimate.status === 'rejected' || estimate.status === 'expired' ? 'destructive' :
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
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditEstimate(estimate)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Estimate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGeneratePDF(estimate)} disabled={generating}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        {estimate.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(estimate.id, 'sent')}>
                            <Send className="h-4 w-4 mr-2" />
                            Send to Customer
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
                          <X className="h-4 w-4 mr-2" />
                          Delete Estimate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredEstimates.length === 0 && (
            <div className="text-center py-12">
              {searchTerm ? (
                <div>
                  <p className="text-gray-500 mb-2">No estimates found matching "{searchTerm}"</p>
                  <p className="text-sm text-gray-400">Try adjusting your search terms</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500">No estimates found.</p>
                  <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Estimate
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Read-only View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Estimate Details - {selectedEstimate?.estimate_number}
            </DialogTitle>
          </DialogHeader>
          {selectedEstimate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Estimate Information</h3>
                  <p><strong>Title:</strong> {selectedEstimate.title}</p>
                  <p><strong>Status:</strong> <Badge className="ml-2 capitalize">{selectedEstimate.status}</Badge></p>
                  <p><strong>Valid Until:</strong> {selectedEstimate.valid_until ? new Date(selectedEstimate.valid_until).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  {selectedEstimate.customers ? (
                    <div>
                      <p><strong>Name:</strong> {selectedEstimate.customers.first_name} {selectedEstimate.customers.last_name}</p>
                      <p><strong>Email:</strong> {selectedEstimate.customers.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {selectedEstimate.customers.phone || 'N/A'}</p>
                    </div>
                  ) : (
                    <p>No customer assigned</p>
                  )}
                </div>
              </div>
              
              {selectedEstimate.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedEstimate.description}</p>
                </div>
              )}

              <EstimateLineItemsDisplay estimateId={selectedEstimate.id} />

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <Button onClick={() => handleEditEstimate(selectedEstimate)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Estimate
                  </Button>
                  <Button onClick={() => handleGeneratePDF(selectedEstimate)} disabled={generating}>
                    <Download className="h-4 w-4 mr-2" />
                    {generating ? 'Generating...' : 'Download PDF'}
                  </Button>
                  {selectedEstimate.status === 'draft' && (
                    <Button 
                      variant="outline"
                      onClick={() => handleStatusChange(selectedEstimate.id, 'sent')}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send to Customer
                    </Button>
                  )}
                  {selectedEstimate.status === 'approved' && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        console.log('Create invoice from estimate:', selectedEstimate.id);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg"><strong>Total: ${(selectedEstimate.total_amount || 0).toFixed(2)}</strong></p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Estimate - {selectedEstimate?.estimate_number}</DialogTitle>
          </DialogHeader>
          {selectedEstimate && (
            <EstimateForm
              onSubmit={handleUpdateEstimate}
              onCancel={() => setIsEditModalOpen(false)}
              initialData={selectedEstimate}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the estimate and all associated line items.
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
