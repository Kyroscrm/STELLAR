
import { useState } from 'react';
import { toast } from 'sonner';

export const useJobNumberGenerator = () => {
  const [loading, setLoading] = useState(false);

  const generateEstimateNumber = async (): Promise<string> => {
    setLoading(true);
    try {
      // Simple estimate number generation based on timestamp
      const timestamp = Date.now();
      const estimateNumber = `EST-${timestamp.toString().slice(-6)}`;
      return estimateNumber;
    } catch (error) {
      console.error('Error generating estimate number:', error);
      toast.error('Failed to generate estimate number');
      return `EST-${Math.floor(Math.random() * 100000)}`;
    } finally {
      setLoading(false);
    }
  };

  const generateJobNumber = async (): Promise<string> => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const jobNumber = `JOB-${timestamp.toString().slice(-6)}`;
      return jobNumber;
    } catch (error) {
      console.error('Error generating job number:', error);
      toast.error('Failed to generate job number');
      return `JOB-${Math.floor(Math.random() * 100000)}`;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateEstimateNumber,
    generateJobNumber,
    loading
  };
};
