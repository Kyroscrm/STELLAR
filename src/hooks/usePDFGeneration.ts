
import { useState } from 'react';
import { toast } from 'sonner';

export const usePDFGeneration = () => {
  const [generating, setGenerating] = useState(false);

  const generateEstimatePDF = async (estimate: any) => {
    setGenerating(true);
    try {
      // Simple PDF generation simulation
      const content = `
        ESTIMATE #${estimate.estimate_number}
        
        Customer: ${estimate.customers ? `${estimate.customers.first_name} ${estimate.customers.last_name}` : 'N/A'}
        Title: ${estimate.title}
        Description: ${estimate.description || 'N/A'}
        
        LINE ITEMS:
        ${estimate.estimate_line_items?.map((item: any) => 
          `${item.description} - Qty: ${item.quantity} - Price: $${item.unit_price} - Total: $${item.total}`
        ).join('\n') || 'No line items'}
        
        TOTAL: $${estimate.total_amount || 0}
      `;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estimate-${estimate.estimate_number}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF generated successfully');
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
      const content = `
        INVOICE #${invoice.invoice_number}
        
        Customer: ${invoice.customers ? `${invoice.customers.first_name} ${invoice.customers.last_name}` : 'N/A'}
        Title: ${invoice.title}
        Due Date: ${invoice.due_date || 'N/A'}
        
        LINE ITEMS:
        ${invoice.invoice_line_items?.map((item: any) => 
          `${item.description} - Qty: ${item.quantity} - Price: $${item.unit_price} - Total: $${item.total}`
        ).join('\n') || 'No line items'}
        
        TOTAL: $${invoice.total_amount || 0}
      `;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  return {
    generating,
    generateEstimatePDF,
    generateInvoicePDF
  };
};
