import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuditTrail } from '@/hooks/useAuditTrail';

export interface ChangeOrder {
  id: string;
  job_id: string;
  change_order_number: string;
  title: string;
  description: string;
  change_type: 'addition' | 'removal' | 'modification' | 'scope_change';
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed';
  original_amount: number;
  change_amount: number;
  new_total_amount: number;
  reason: string;
  requested_by: string;
  requested_at: string;
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;
  labor_hours_change?: number;
  material_cost_change?: number;
  created_at: string;
  updated_at: string;
  // Relations
  job?: {
    id: string;
    title: string;
    customer_id: string;
    total_amount?: number;
  };
  requester?: {
    id: string;
    email: string;
  };
  approver?: {
    id: string;
    email: string;
  };
}

export interface CreateChangeOrderData {
  job_id: string;
  title: string;
  description: string;
  change_type: 'addition' | 'removal' | 'modification' | 'scope_change';
  original_amount: number;
  change_amount: number;
  reason: string;
  requested_by: string;
  labor_hours_change?: number;
  material_cost_change?: number;
}

export interface UpdateChangeOrderData {
  id: string;
  title?: string;
  description?: string;
  change_type?: 'addition' | 'removal' | 'modification' | 'scope_change';
  status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed';
  change_amount?: number;
  reason?: string;
  approved_by?: string;
  rejected_reason?: string;
  labor_hours_change?: number;
  material_cost_change?: number;
}

export interface ChangeOrderFilters {
  job_id?: string;
  change_type?: 'addition' | 'removal' | 'modification' | 'scope_change';
  status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed';
  requested_by?: string;
  approved_by?: string;
  date_from?: string;
  date_to?: string;
}

export function useChangeOrders() {
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { logUserActivity } = useAuditTrail();

  // Fetch change orders with optional filters
  const fetchChangeOrders = async (filters?: ChangeOrderFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('change_orders')
        .select(`
          *,
          job:jobs(id, title, customer_id, total_amount),
          requester:profiles!requested_by(id, email),
          approver:profiles!approved_by(id, email)
        `)
        .order('requested_at', { ascending: false });

      // Apply filters
      if (filters?.job_id) {
        query = query.eq('job_id', filters.job_id);
      }
      if (filters?.change_type) {
        query = query.eq('change_type', filters.change_type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.requested_by) {
        query = query.eq('requested_by', filters.requested_by);
      }
      if (filters?.approved_by) {
        query = query.eq('approved_by', filters.approved_by);
      }
      if (filters?.date_from) {
        query = query.gte('requested_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('requested_at', filters.date_to);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(`Failed to fetch change orders: ${fetchError.message}`);
      }

      setChangeOrders(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create change order with optimistic update
  const createChangeOrder = async (changeOrderData: CreateChangeOrderData): Promise<ChangeOrder | null> => {
    try {
      // Validation
      if (!changeOrderData.job_id || !changeOrderData.title || !changeOrderData.requested_by) {
        throw new Error('Job ID, title, and requester are required');
      }

      // Calculate new total amount
      const newTotalAmount = changeOrderData.original_amount + changeOrderData.change_amount;

      // Generate change order number
      const changeOrderNumber = `CO-${Date.now()}`;

      const fullData = {
        ...changeOrderData,
        change_order_number: changeOrderNumber,
        new_total_amount: newTotalAmount,
        status: 'draft' as const,
        requested_at: new Date().toISOString(),
      };

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticOrder: ChangeOrder = {
        id: tempId,
        ...fullData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setChangeOrders(prev => [optimisticOrder, ...prev]);

      const { data, error: createError } = await supabase
        .from('change_orders')
        .insert([fullData])
        .select(`
          *,
          job:jobs(id, title, customer_id, total_amount),
          requester:profiles!requested_by(id, email),
          approver:profiles!approved_by(id, email)
        `)
        .single();

      if (createError) {
        // Revert optimistic update
        setChangeOrders(prev => prev.filter(order => order.id !== tempId));
        throw new Error(`Failed to create change order: ${createError.message}`);
      }

      // Replace optimistic update with real data
      setChangeOrders(prev =>
        prev.map(order => order.id === tempId ? data : order)
      );

      // Log activity
      await logUserActivity(
        'create',
        'change_order',
        data.id,
        `Change order created: ${data.title}`,
        {
          change_amount: data.change_amount,
          change_type: data.change_type,
          job_id: data.job_id
        }
      );

      toast({
        title: "Success",
        description: "Change order created successfully",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create change order';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // Update change order with optimistic update
  const updateChangeOrder = async (updateData: UpdateChangeOrderData): Promise<ChangeOrder | null> => {
    try {
      if (!updateData.id) {
        throw new Error('Change order ID is required');
      }

      // Calculate new total if change_amount updated
      const existingOrder = changeOrders.find(order => order.id === updateData.id);
      const calculatedData = { ...updateData };

      if (updateData.change_amount && existingOrder) {
        calculatedData.new_total_amount = existingOrder.original_amount + updateData.change_amount;
      }

      // Add approval timestamp if approving
      if (updateData.status === 'approved' && updateData.approved_by) {
        calculatedData.approved_at = new Date().toISOString();
      }

      // Optimistic update
      setChangeOrders(prev =>
        prev.map(order =>
          order.id === updateData.id
            ? { ...order, ...calculatedData, updated_at: new Date().toISOString() }
            : order
        )
      );

      const { data, error: updateError } = await supabase
        .from('change_orders')
        .update(calculatedData)
        .eq('id', updateData.id)
        .select(`
          *,
          job:jobs(id, title, customer_id, total_amount),
          requester:profiles!requested_by(id, email),
          approver:profiles!approved_by(id, email)
        `)
        .single();

      if (updateError) {
        // Revert optimistic update
        await fetchChangeOrders();
        throw new Error(`Failed to update change order: ${updateError.message}`);
      }

      // Update with real data
      setChangeOrders(prev =>
        prev.map(order => order.id === updateData.id ? data : order)
      );

      // Log activity
      await logUserActivity(
        'update',
        'change_order',
        data.id,
        `Change order updated: ${data.title}`,
        { changes: updateData }
      );

      toast({
        title: "Success",
        description: "Change order updated successfully",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update change order';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete change order with optimistic update
  const deleteChangeOrder = async (id: string): Promise<boolean> => {
    try {
      if (!id) {
        throw new Error('Change order ID is required');
      }

      // Store original for potential revert
      const originalOrder = changeOrders.find(order => order.id === id);

      // Optimistic update
      setChangeOrders(prev => prev.filter(order => order.id !== id));

      const { error: deleteError } = await supabase
        .from('change_orders')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Revert optimistic update
        if (originalOrder) {
          setChangeOrders(prev => [originalOrder, ...prev]);
        }
        throw new Error(`Failed to delete change order: ${deleteError.message}`);
      }

      // Log activity
      await logUserActivity(
        'delete',
        'change_order',
        id,
        'Change order deleted',
        { deleted_order: originalOrder }
      );

      toast({
        title: "Success",
        description: "Change order deleted successfully",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete change order';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Approve change order
  const approveChangeOrder = async (id: string, approverId: string): Promise<ChangeOrder | null> => {
    return updateChangeOrder({
      id,
      status: 'approved',
      approved_by: approverId,
    });
  };

  // Reject change order
  const rejectChangeOrder = async (id: string, reason: string): Promise<ChangeOrder | null> => {
    return updateChangeOrder({
      id,
      status: 'rejected',
      rejected_reason: reason,
    });
  };

  // Submit for approval
  const submitForApproval = async (id: string): Promise<ChangeOrder | null> => {
    return updateChangeOrder({
      id,
      status: 'pending_approval',
    });
  };

  // Mark as completed
  const markCompleted = async (id: string): Promise<ChangeOrder | null> => {
    return updateChangeOrder({
      id,
      status: 'completed',
    });
  };

  // Get change orders for a specific job
  const getChangeOrdersByJob = (jobId: string) => {
    return changeOrders.filter(order => order.job_id === jobId);
  };

  // Get change orders by status
  const getChangeOrdersByStatus = (status: ChangeOrder['status']) => {
    return changeOrders.filter(order => order.status === status);
  };

  // Calculate totals
  const getTotals = (orders: ChangeOrder[] = changeOrders) => {
    return orders.reduce((totals, order) => ({
      totalChangeAmount: totals.totalChangeAmount + (order.change_amount || 0),
      approvedChangeAmount: totals.approvedChangeAmount + (order.status === 'approved' ? (order.change_amount || 0) : 0),
      pendingChangeAmount: totals.pendingChangeAmount + (order.status === 'pending_approval' ? (order.change_amount || 0) : 0),
      rejectedChangeAmount: totals.rejectedChangeAmount + (order.status === 'rejected' ? (order.change_amount || 0) : 0),
    }), {
      totalChangeAmount: 0,
      approvedChangeAmount: 0,
      pendingChangeAmount: 0,
      rejectedChangeAmount: 0,
    });
  };

  // Initialize
  useEffect(() => {
    fetchChangeOrders();
  }, []);

  return {
    changeOrders,
    loading,
    error,
    fetchChangeOrders,
    createChangeOrder,
    updateChangeOrder,
    deleteChangeOrder,
    approveChangeOrder,
    rejectChangeOrder,
    submitForApproval,
    markCompleted,
    getChangeOrdersByJob,
    getChangeOrdersByStatus,
    getTotals,
    refetch: fetchChangeOrders,
  };
}
