import { useState } from 'react';
import { toast } from 'sonner';
import { useLogoSettings } from './useLogoSettings';
import type { Estimate, Invoice } from '@/types/app-types';

export const usePDFGeneration = () => {
  const [generating, setGenerating] = useState(false);
  const { settings: logoSettings } = useLogoSettings();

  const generateEstimatePDF = async (estimate: Estimate) => {
    setGenerating(true);
    try {
      const { generateEstimatePDF: generatePDF } = await import('@/lib/pdf-generator');
      await generatePDF(estimate, logoSettings);
      toast.success('Estimate PDF generated successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to generate PDF: ${error.message}`);
      } else {
        toast.error('Failed to generate PDF');
      }
    } finally {
      setGenerating(false);
    }
  };

  const generateInvoicePDF = async (invoice: Invoice) => {
    setGenerating(true);
    try {
      const { generateInvoicePDF: generatePDF } = await import('@/lib/pdf-generator');
      await generatePDF(invoice, logoSettings);
      toast.success('Invoice PDF generated successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to generate PDF: ${error.message}`);
      } else {
        toast.error('Failed to generate PDF');
      }
    } finally {
      setGenerating(false);
    }
  };

  return {
    generating,
    generateEstimatePDF,
    generateInvoicePDF,
  };
};
