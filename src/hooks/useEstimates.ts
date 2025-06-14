import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast'; // Corrected import path
import { Database } from '@/integrations/supabase/types';

export type Estimate = Database['public']['Tables']['estimates']['Row'];
export type EstimateLineItem = Database['public']['Tables']['estimate_line_items']['Row'];

export interface EstimateWithLineItems extends Estimate {
  estimate_line_items: EstimateLineItem[];
}

export const useEstimates = () => {
  const { user } = useAuth();
  const [estimates, setEstimates] = useState<EstimateWithLineItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEstimates = async () => {
      if (!user) {
        setEstimates([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch estimates and their line items
        // This might need to be adjusted based on your actual data structure and relationships in Supabase
        // For simplicity, we'll fetch estimates first, then line items for each, or use a view/RPC if available.
        const { data, error: supabaseError } = await supabase
          .from('estimates')
          .select(`
            *,
            estimate_line_items ( * )
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
        toast({
          title: "Error fetching estimates",
          description: err.message || "Could not retrieve estimates from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, [user]);

  // Placeholder CRUD functions
  // TODO: Implement with Supabase calls
  const addEstimate = async (newEstimateData: Omit<Estimate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    console.log('Adding estimate:', newEstimateData);
    toast({ title: "Estimate added (mock)" });
  };
  
  const updateEstimate = async (estimateId: string, updatedEstimateData: Partial<Estimate>) => {
    console.log('Updating estimate:', estimateId, updatedEstimateData);
    toast({ title: "Estimate updated (mock)" });
  };

  const deleteEstimate = async (estimateId: string) => {
    console.log('Deleting estimate:', estimateId);
    toast({ title: "Estimate deleted (mock)", variant: "destructive" });
  };


  return { estimates, loading, error, addEstimate, updateEstimate, deleteEstimate };
};
