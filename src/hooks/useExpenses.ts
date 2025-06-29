import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuditTrail } from '@/hooks/useAuditTrail';

export interface Expense {
  id: string;
  job_id?: string;
  category: 'materials' | 'labor' | 'equipment' | 'travel' | 'permits' | 'subcontractor' | 'office' | 'other';
  subcategory?: string;
  title: string;
  description?: string;
  amount: number;
  tax_amount?: number;
  total_amount: number;
  expense_date: string;
  paid_date?: string;
  payment_method?: 'cash' | 'check' | 'card' | 'bank_transfer' | 'company_account';
  vendor?: string;
  receipt_url?: string;
  billable: boolean;
  reimbursable: boolean;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'paid';
  submitted_by: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  accounting_code?: string;
  project_phase?: string;
  created_at: string;
  updated_at: string;
  // Relations
  job?: {
    id: string;
    title: string;
    customer_id: string;
  };
  submitter?: {
    id: string;
    email: string;
  };
  approver?: {
    id: string;
    email: string;
  };
}

export interface CreateExpenseData {
  job_id?: string;
  category: 'materials' | 'labor' | 'equipment' | 'travel' | 'permits' | 'subcontractor' | 'office' | 'other';
  subcategory?: string;
  title: string;
  description?: string;
  amount: number;
  tax_amount?: number;
  expense_date: string;
  payment_method?: 'cash' | 'check' | 'card' | 'bank_transfer' | 'company_account';
  vendor?: string;
  receipt_url?: string;
  billable?: boolean;
  reimbursable?: boolean;
  submitted_by: string;
  accounting_code?: string;
  project_phase?: string;
}

export interface UpdateExpenseData {
  id: string;
  category?: 'materials' | 'labor' | 'equipment' | 'travel' | 'permits' | 'subcontractor' | 'office' | 'other';
  subcategory?: string;
  title?: string;
  description?: string;
  amount?: number;
  tax_amount?: number;
  expense_date?: string;
  paid_date?: string;
  payment_method?: 'cash' | 'check' | 'card' | 'bank_transfer' | 'company_account';
  vendor?: string;
  receipt_url?: string;
  billable?: boolean;
  reimbursable?: boolean;
  status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'paid';
  approved_by?: string;
  rejection_reason?: string;
  accounting_code?: string;
  project_phase?: string;
}

export interface ExpenseFilters {
  job_id?: string;
  category?: 'materials' | 'labor' | 'equipment' | 'travel' | 'permits' | 'subcontractor' | 'office' | 'other';
  status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'paid';
  submitted_by?: string;
  approved_by?: string;
  billable?: boolean;
  reimbursable?: boolean;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { logUserActivity } = useAuditTrail();

  // Fetch expenses with optional filters
  const fetchExpenses = async (filters?: ExpenseFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('expenses')
        .select(`
          *,
          job:jobs(id, title, customer_id),
          submitter:profiles!submitted_by(id, email),
          approver:profiles!approved_by(id, email)
        `)
        .order('expense_date', { ascending: false });

      // Apply filters
      if (filters?.job_id) {
        query = query.eq('job_id', filters.job_id);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.submitted_by) {
        query = query.eq('submitted_by', filters.submitted_by);
      }
      if (filters?.approved_by) {
        query = query.eq('approved_by', filters.approved_by);
      }
      if (filters?.billable !== undefined) {
        query = query.eq('billable', filters.billable);
      }
      if (filters?.reimbursable !== undefined) {
        query = query.eq('reimbursable', filters.reimbursable);
      }
      if (filters?.date_from) {
        query = query.gte('expense_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('expense_date', filters.date_to);
      }
      if (filters?.amount_min) {
        query = query.gte('amount', filters.amount_min);
      }
      if (filters?.amount_max) {
        query = query.lte('amount', filters.amount_max);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(`Failed to fetch expenses: ${fetchError.message}`);
      }

      setExpenses(data || []);
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

  // Create expense with optimistic update
  const createExpense = async (expenseData: CreateExpenseData): Promise<Expense | null> => {
    try {
      // Validation
      if (!expenseData.title || !expenseData.amount || !expenseData.submitted_by) {
        throw new Error('Title, amount, and submitter are required');
      }

      // Calculate total amount including tax
      const totalAmount = expenseData.amount + (expenseData.tax_amount || 0);

      const fullData = {
        ...expenseData,
        total_amount: totalAmount,
        status: 'draft' as const,
        billable: expenseData.billable ?? false,
        reimbursable: expenseData.reimbursable ?? false,
      };

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticExpense: Expense = {
        id: tempId,
        ...fullData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setExpenses(prev => [optimisticExpense, ...prev]);

      const { data, error: createError } = await supabase
        .from('expenses')
        .insert([fullData])
        .select(`
          *,
          job:jobs(id, title, customer_id),
          submitter:profiles!submitted_by(id, email),
          approver:profiles!approved_by(id, email)
        `)
        .single();

      if (createError) {
        // Revert optimistic update
        setExpenses(prev => prev.filter(expense => expense.id !== tempId));
        throw new Error(`Failed to create expense: ${createError.message}`);
      }

      // Replace optimistic update with real data
      setExpenses(prev =>
        prev.map(expense => expense.id === tempId ? data : expense)
      );

      // Log activity
      await logUserActivity(
        'create',
        'expense',
        data.id,
        `Expense created: ${data.title}`,
        {
          amount: data.amount,
          category: data.category,
          job_id: data.job_id
        }
      );

      toast({
        title: "Success",
        description: "Expense created successfully",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create expense';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // Update expense with optimistic update
  const updateExpense = async (updateData: UpdateExpenseData): Promise<Expense | null> => {
    try {
      if (!updateData.id) {
        throw new Error('Expense ID is required');
      }

      // Calculate total amount if amount or tax_amount updated
      const calculatedData = { ...updateData };
      const existingExpense = expenses.find(expense => expense.id === updateData.id);

      if ((updateData.amount || updateData.tax_amount) && existingExpense) {
        const newAmount = updateData.amount ?? existingExpense.amount;
        const newTaxAmount = updateData.tax_amount ?? existingExpense.tax_amount ?? 0;
        calculatedData.total_amount = newAmount + newTaxAmount;
      }

      // Add approval timestamp if approving
      if (updateData.status === 'approved' && updateData.approved_by) {
        calculatedData.approved_at = new Date().toISOString();
      }

      // Add paid date if marking as paid
      if (updateData.status === 'paid' && !updateData.paid_date) {
        calculatedData.paid_date = new Date().toISOString();
      }

      // Optimistic update
      setExpenses(prev =>
        prev.map(expense =>
          expense.id === updateData.id
            ? { ...expense, ...calculatedData, updated_at: new Date().toISOString() }
            : expense
        )
      );

      const { data, error: updateError } = await supabase
        .from('expenses')
        .update(calculatedData)
        .eq('id', updateData.id)
        .select(`
          *,
          job:jobs(id, title, customer_id),
          submitter:profiles!submitted_by(id, email),
          approver:profiles!approved_by(id, email)
        `)
        .single();

      if (updateError) {
        // Revert optimistic update
        await fetchExpenses();
        throw new Error(`Failed to update expense: ${updateError.message}`);
      }

      // Update with real data
      setExpenses(prev =>
        prev.map(expense => expense.id === updateData.id ? data : expense)
      );

      // Log activity
      await logUserActivity(
        'update',
        'expense',
        data.id,
        `Expense updated: ${data.title}`,
        { changes: updateData }
      );

      toast({
        title: "Success",
        description: "Expense updated successfully",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expense';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete expense with optimistic update
  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      if (!id) {
        throw new Error('Expense ID is required');
      }

      // Store original for potential revert
      const originalExpense = expenses.find(expense => expense.id === id);

      // Optimistic update
      setExpenses(prev => prev.filter(expense => expense.id !== id));

      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Revert optimistic update
        if (originalExpense) {
          setExpenses(prev => [originalExpense, ...prev]);
        }
        throw new Error(`Failed to delete expense: ${deleteError.message}`);
      }

      // Log activity
      await logUserActivity(
        'delete',
        'expense',
        id,
        'Expense deleted',
        { deleted_expense: originalExpense }
      );

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Submit for approval
  const submitForApproval = async (id: string): Promise<Expense | null> => {
    return updateExpense({
      id,
      status: 'pending_approval',
    });
  };

  // Approve expense
  const approveExpense = async (id: string, approverId: string): Promise<Expense | null> => {
    return updateExpense({
      id,
      status: 'approved',
      approved_by: approverId,
    });
  };

  // Reject expense
  const rejectExpense = async (id: string, reason: string): Promise<Expense | null> => {
    return updateExpense({
      id,
      status: 'rejected',
      rejection_reason: reason,
    });
  };

  // Mark as paid
  const markAsPaid = async (id: string, paidDate?: string): Promise<Expense | null> => {
    return updateExpense({
      id,
      status: 'paid',
      paid_date: paidDate || new Date().toISOString(),
    });
  };

  // Get expenses for a specific job
  const getExpensesByJob = (jobId: string) => {
    return expenses.filter(expense => expense.job_id === jobId);
  };

  // Get expenses by category
  const getExpensesByCategory = (category: Expense['category']) => {
    return expenses.filter(expense => expense.category === category);
  };

  // Get expenses by status
  const getExpensesByStatus = (status: Expense['status']) => {
    return expenses.filter(expense => expense.status === status);
  };

  // Get billable expenses
  const getBillableExpenses = () => {
    return expenses.filter(expense => expense.billable);
  };

  // Get reimbursable expenses
  const getReimbursableExpenses = () => {
    return expenses.filter(expense => expense.reimbursable);
  };

  // Calculate totals
  const getTotals = (expenseList: Expense[] = expenses) => {
    return expenseList.reduce((totals, expense) => ({
      totalAmount: totals.totalAmount + (expense.total_amount || 0),
      approvedAmount: totals.approvedAmount + (expense.status === 'approved' ? (expense.total_amount || 0) : 0),
      paidAmount: totals.paidAmount + (expense.status === 'paid' ? (expense.total_amount || 0) : 0),
      pendingAmount: totals.pendingAmount + (expense.status === 'pending_approval' ? (expense.total_amount || 0) : 0),
      billableAmount: totals.billableAmount + (expense.billable ? (expense.total_amount || 0) : 0),
      reimbursableAmount: totals.reimbursableAmount + (expense.reimbursable ? (expense.total_amount || 0) : 0),
    }), {
      totalAmount: 0,
      approvedAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      billableAmount: 0,
      reimbursableAmount: 0,
    });
  };

  // Get totals by category
  const getTotalsByCategory = () => {
    const categories: Record<string, number> = {};
    expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.total_amount;
    });
    return categories;
  };

  // Initialize
  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    submitForApproval,
    approveExpense,
    rejectExpense,
    markAsPaid,
    getExpensesByJob,
    getExpensesByCategory,
    getExpensesByStatus,
    getBillableExpenses,
    getReimbursableExpenses,
    getTotals,
    getTotalsByCategory,
    refetch: fetchExpenses,
  };
}
