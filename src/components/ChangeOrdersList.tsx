import React, { useState } from 'react';
import { useChangeOrders, type ChangeOrder } from '@/hooks/useChangeOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreHorizontal, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChangeOrderForm } from './ChangeOrderForm';
import ConfirmDialog from './ConfirmDialog';
import { toast } from '@/components/ui/use-toast';
import SkeletonLoader from './ui/skeleton-loader';
import { formatCurrency } from '@/lib/utils';

interface ChangeOrdersListProps {
  jobId: string;
  jobNumber: string;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
}

export const ChangeOrdersList: React.FC<ChangeOrdersListProps> = ({
  jobId,
  jobNumber,
  onCreateSuccess,
  onUpdateSuccess,
}) => {
  const { changeOrders, loading, fetchChangeOrders, deleteChangeOrder } = useChangeOrders();

  React.useEffect(() => {
    fetchChangeOrders({ job_id: jobId });
  }, [jobId, fetchChangeOrders]);

  const [selectedOrder, setSelectedOrder] = React.useState<ChangeOrder | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Filter change orders for this job
  const jobChangeOrders = React.useMemo(() => {
    return changeOrders.filter(order => order.job_id === jobId);
  }, [changeOrders, jobId]);

  // Calculate totals
  const totals = React.useMemo(() => {
    return jobChangeOrders.reduce(
      (acc, order) => ({
        totalChanges: acc.totalChanges + (order.change_amount || 0),
        approvedChanges: acc.approvedChanges + (order.status === 'approved' ? (order.change_amount || 0) : 0),
        pendingChanges: acc.pendingChanges + (order.status === 'pending_approval' ? (order.change_amount || 0) : 0),
      }),
      { totalChanges: 0, approvedChanges: 0, pendingChanges: 0 }
    );
  }, [jobChangeOrders]);

  const getStatusBadgeVariant = (status: ChangeOrder['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'pending_approval':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const handleEditClick = (order: ChangeOrder) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedOrder(null);
    fetchChangeOrders({ job_id: jobId });
    onUpdateSuccess?.();
  };

  const handleDelete = async (order: ChangeOrder) => {
    try {
      await deleteChangeOrder(order.id);
      toast({
        title: "Success",
        description: "Change order deleted successfully",
      });
      fetchChangeOrders({ job_id: jobId });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete change order",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <SkeletonLoader type="card" count={3} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Change Orders</h3>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Change Order
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Change Orders</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Change Order</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <ChangeOrderForm
                jobId={jobId}
                onSuccess={() => {
                  fetchChangeOrders();
                  onCreateSuccess?.();
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-secondary/10 rounded-lg">
              <div className="text-sm font-medium">Total Changes</div>
              <div className="text-2xl font-bold">{formatCurrency(totals.totalChanges)}</div>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <div className="text-sm font-medium">Approved Changes</div>
              <div className="text-2xl font-bold">{formatCurrency(totals.approvedChanges)}</div>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg">
              <div className="text-sm font-medium">Pending Changes</div>
              <div className="text-2xl font-bold">{formatCurrency(totals.pendingChanges)}</div>
            </div>
          </div>

          <div className="divide-y">
            {jobChangeOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No change orders found for this job
              </div>
            ) : (
              jobChangeOrders.map((order) => (
                <div key={order.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{order.title}</h3>
                        <Badge className={getStatusBadgeVariant(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{order.description}</p>
                      <div className="mt-2 space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Change Type:</span> {order.change_type.replace('_', ' ')}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Amount:</span> {formatCurrency(order.change_amount)}
                        </div>
                        {order.labor_hours_change && (
                          <div className="text-sm">
                            <span className="font-medium">Labor Hours:</span> {order.labor_hours_change}
                          </div>
                        )}
                        {order.material_cost_change && (
                          <div className="text-sm">
                            <span className="font-medium">Material Cost:</span> {formatCurrency(order.material_cost_change)}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(order)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Change Order</DialogTitle>
          </DialogHeader>
          <ChangeOrderForm
            jobId={jobId}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Change Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <ChangeOrderForm
              jobId={jobId}
              existingChangeOrder={selectedOrder}
              onSuccess={handleEditSuccess}
              onCancel={() => setSelectedOrder(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
        title="Delete Change Order"
        description="Are you sure you want to delete this change order? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => handleDelete(selectedOrder!)}
      />
    </div>
  );
};

export default ChangeOrdersList;
