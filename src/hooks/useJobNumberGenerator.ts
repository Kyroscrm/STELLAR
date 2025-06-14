
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useJobNumberGenerator = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const generateJobNumber = async (): Promise<string> => {
    if (!user) return `JOB-${Date.now()}`;

    setLoading(true);
    try {
      // Get the current year
      const year = new Date().getFullYear();
      
      // Get the count of jobs for this user this year
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', `${year}-01-01`)
        .lt('created_at', `${year + 1}-01-01`);

      if (error) throw error;

      const jobCount = (jobs?.length || 0) + 1;
      const paddedNumber = jobCount.toString().padStart(4, '0');
      
      return `JOB-${year}-${paddedNumber}`;
    } catch (error) {
      console.error('Error generating job number:', error);
      return `JOB-${Date.now()}`;
    } finally {
      setLoading(false);
    }
  };

  const generateEstimateNumber = async (): Promise<string> => {
    if (!user) return `EST-${Date.now()}`;

    setLoading(true);
    try {
      const year = new Date().getFullYear();
      
      const { data: estimates, error } = await supabase
        .from('estimates')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', `${year}-01-01`)
        .lt('created_at', `${year + 1}-01-01`);

      if (error) throw error;

      const estimateCount = (estimates?.length || 0) + 1;
      const paddedNumber = estimateCount.toString().padStart(4, '0');
      
      return `EST-${year}-${paddedNumber}`;
    } catch (error) {
      console.error('Error generating estimate number:', error);
      return `EST-${Date.now()}`;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateJobNumber,
    generateEstimateNumber,
    loading
  };
};
