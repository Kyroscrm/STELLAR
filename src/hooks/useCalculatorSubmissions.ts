
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CalculatorSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  project_type: string;
  square_footage?: number;
  bathrooms?: number;
  timeline?: string;
  budget?: string;
  description?: string;
  estimate_amount?: number;
  created_at: string;
}

export const useCalculatorSubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<CalculatorSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calculator_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Error fetching calculator submissions:', error);
      toast.error('Failed to fetch calculator submissions');
    } finally {
      setLoading(false);
    }
  };

  const createSubmission = async (submissionData: Omit<CalculatorSubmission, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('calculator_submissions')
        .insert({
          ...submissionData,
          user_id: user?.id || null
        })
        .select()
        .single();

      if (error) throw error;

      if (user) {
        setSubmissions(prev => [data, ...prev]);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error creating calculator submission:', error);
      toast.error('Failed to submit calculator form');
      return null;
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('calculator_submissions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSubmissions(prev => prev.filter(submission => submission.id !== id));
      toast.success('Submission deleted successfully');
    } catch (error: any) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  return {
    submissions,
    loading,
    createSubmission,
    deleteSubmission,
    fetchSubmissions
  };
};
