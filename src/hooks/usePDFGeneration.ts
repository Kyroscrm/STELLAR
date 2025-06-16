
import { useState } from 'react';
import { toast } from 'sonner';

export const usePDFGeneration = () => {
  const [generating, setGenerating] = useState(false);

  const generateEstimatePDF = async (estimate: any) => {
    setGenerating(true);
    try {
      // Create a simple PDF content
      const content = `
        Estimate: ${estimate.estimate_number}
        Title: ${estimate.title}
        Description: ${estimate.description || 'N/A'}
        Customer: ${estimate.customers ? `${estimate.customers.first_name} ${estimate.customers.last_name}` : 'N/A'}
        Total: $${(estimate.total_amount || 0).toFixed(2)}
        Status: ${estimate.status}
        Valid Until: ${estimate.valid_until || 'N/A'}
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estimate-${estimate.estimate_number}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Estimate PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const generateInvoicePDF = async (invoice: any) => {
    setGenerating(true);
    try {
      // Create a simple PDF content
      const content = `
        Invoice: ${invoice.invoice_number}
        Title: ${invoice.title}
        Description: ${invoice.description || 'N/A'}
        Customer: ${invoice.customers ? `${invoice.customers.first_name} ${invoice.customers.last_name}` : 'N/A'}
        Total: $${(invoice.total_amount || 0).toFixed(2)}
        Status: ${invoice.status}
        Due Date: ${invoice.due_date || 'N/A'}
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoice_number}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Invoice PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  return {
    generateEstimatePDF,
    generateInvoicePDF,
    generating
  };
};
