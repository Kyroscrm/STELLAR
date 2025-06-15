
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

export type Estimate = Database['public']['Tables']['estimates']['Row'];
export type EstimateLineItem = Database['public']['Tables']['estimate_line_items']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];

export interface EstimateWithLineItems extends Estimate {
  estimate_line_items: EstimateLineItem[];
  customers?: Customer | null;
  jobs?: Job | null;
}

export const useEstimates = () => {
  const { user } = useAuth();
  const [estimates, setEstimates] = useState<EstimateWithLineItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEstimates = async () => {
    if (!user) {
      setEstimates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('estimates')
        .select(`
          *,
          estimate_line_items ( * ),
          customers ( * ),
          jobs ( * )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }
      
      setEstimates(data as EstimateWithLineItems[] || []);
    } catch (err: any) {
      console.error('Error fetching estimates:', err);
      setError(err);
      toast.error('Error fetching estimates: ' + (err.message || 'Could not retrieve estimates from the server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [user]);

  const addEstimate = async (newEstimateData: Omit<Estimate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('estimates')
        .insert([{ ...newEstimateData, user_id: user.id }])
        .select(`
          *,
          estimate_line_items ( * ),
          customers ( * ),
          jobs ( * )
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
    } catch (err: any) {
      console.error('Error creating estimate:', err);
      toast.error('Error creating estimate: ' + (err.message || 'Could not create the estimate.'));
      return null;
    }
  };
  
  const updateEstimate = async (estimateId: string, updatedEstimateData: Partial<Estimate>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('estimates')
        .update(updatedEstimateData)
        .eq('id', estimateId)
        .eq('user_id', user.id)
        .select(`
          *,
          estimate_line_items ( * ),
          customers ( * ),
          jobs ( * )
        `)
        .single();

      if (error) throw error;

      setEstimates(prev => prev.map(estimate => 
        estimate.id === estimateId ? data : estimate
      ));
      
      toast.success('Estimate updated successfully');

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: estimateId,
        action: 'updated',
        description: `Estimate updated`
      });

      return data;
    } catch (err: any) {
      console.error('Error updating estimate:', err);
      toast.error('Error updating estimate: ' + (err.message || 'Could not update the estimate.'));
      return null;
    }
  };

  const deleteEstimate = async (estimateId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', estimateId)
        .eq('user_id', user.id);

      if (error) throw error;

      setEstimates(prev => prev.filter(estimate => estimate.id !== estimateId));
      toast.success('Estimate deleted successfully');

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'estimate',
        entity_id: estimateId,
        action: 'deleted',
        description: `Estimate deleted`
      });
    } catch (err: any) {
      console.error('Error deleting estimate:', err);
      toast.error('Error deleting estimate: ' + (err.message || 'Could not delete the estimate.'));
    }
  };

  return { estimates, loading, error, addEstimate, updateEstimate, deleteEstimate, fetchEstimates };
};
