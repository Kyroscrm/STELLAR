
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Estimate = Tables<'estimates'>;
type EstimateInsert = TablesInsert<'estimates'>;
type EstimateUpdate = TablesUpdate<'estimates'>;
type EstimateLineItem = Tables<'estimate_line_items'>;

export const useEstimates = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchEstimates = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          jobs (
            id,
            title
          ),
          estimate_line_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEstimates(data || []);
    } catch (error: any) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to fetch estimates');
    } finally {
      setLoading(false);
    }
  };

  const createEstimate = async (estimateData: Omit<EstimateInsert, 'user_id'>) => {
    if (!user) return null;

    try {
      // Generate estimate number
      const estimateNumber = `EST-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('estimates')
        .insert({ 
          ...estimateData, 
          user_id: user.id,
          estimate_number: estimateNumber
        })
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          jobs (
            id,
            title
          ),
          estimate_line_items (*)
        `)
        .single();

      if (error) throw error;
      
      setEstimates(prev => [data, ...prev]);
      toast.success('Estimate created successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: data.id,
        action: 'created',
        description: `Estimate created: ${data.title}`
      });

      return data;
    } catch (error: any) {
      console.error('Error creating estimate:', error);
      toast.error('Failed to create estimate');
      return null;
    }
  };

  const updateEstimate = async (id: string, updates: EstimateUpdate) => {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          jobs (
            id,
            title
          ),
          estimate_line_items (*)
        `)
        .single();

      if (error) throw error;
      
      setEstimates(prev => prev.map(estimate => estimate.id === id ? data : estimate));
      toast.success('Estimate updated successfully');
      
      // Log activity
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          entity_type: 'estimate',
          entity_id: id,
          action: 'updated',
          description: `Estimate updated`
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error updating estimate:', error);
      toast.error('Failed to update estimate');
      return null;
    }
  };

  const deleteEstimate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEstimates(prev => prev.filter(estimate => estimate.id !== id));
      toast.success('Estimate deleted successfully');
      
      // Log activity
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          entity_type: 'estimate',
          entity_id: id,
          action: 'deleted',
          description: `Estimate deleted`
        });
      }
    } catch (error: any) {
      console.error('Error deleting estimate:', error);
      toast.error('Failed to delete estimate');
    }
  };

  const convertToInvoice = async (estimateId: string) => {
    try {
      const estimate = estimates.find(e => e.id === estimateId);
      if (!estimate || !user) return null;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create invoice from estimate
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          customer_id: estimate.customer_id,
          job_id: estimate.job_id,
          estimate_id: estimateId,
          invoice_number: invoiceNumber,
          title: estimate.title,
          description: estimate.description,
          subtotal: estimate.subtotal,
          tax_rate: estimate.tax_rate,
          tax_amount: estimate.tax_amount,
          total_amount: estimate.total_amount,
          notes: estimate.notes,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Copy line items if they exist
      const estimateLineItems = (estimate as any).estimate_line_items;
      if (estimateLineItems && estimateLineItems.length > 0) {
        const invoiceLineItems = estimateLineItems.map((item: EstimateLineItem) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          sort_order: item.sort_order
        }));

        await supabase
          .from('invoice_line_items')
          .insert(invoiceLineItems);
      }

      // Update estimate status
      await updateEstimate(estimateId, { status: 'approved' });
      
      toast.success('Estimate converted to invoice successfully');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: estimateId,
        action: 'converted',
        description: `Estimate converted to invoice`
      });

      return invoice;
    } catch (error: any) {
      console.error('Error converting estimate:', error);
      toast.error('Failed to convert estimate to invoice');
      return null;
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [user]);

  return {
    estimates,
    loading,
    fetchEstimates,
    createEstimate,
    updateEstimate,
    deleteEstimate,
    convertToInvoice
  };
};
