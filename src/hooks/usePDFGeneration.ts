
import { useState } from 'react';
import { toast } from 'sonner';

interface EstimateData {
  estimate_number: string;
  title: string;
  description?: string;
  valid_until?: string;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  terms?: string;
  customers?: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
  estimate_line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
}

export const usePDFGeneration = () => {
  const [generating, setGenerating] = useState(false);

  const generateEstimatePDF = async (estimateData: EstimateData) => {
    setGenerating(true);
    try {
      // Create a simple HTML template for PDF generation
      const htmlContent = createEstimateHTML(estimateData);
      
      // Use the browser's print functionality as a simple PDF solution
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }
      
      toast.success('PDF generation initiated');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const createEstimateHTML = (data: EstimateData): string => {
    const lineItemsHTML = data.estimate_line_items?.map(item => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.description}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.unit_price.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.total.toFixed(2)}</td>
      </tr>
    `).join('') || '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Estimate ${data.estimate_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info { text-align: left; }
          .estimate-info { text-align: right; }
          .customer-info { margin-bottom: 30px; padding: 15px; background-color: #f5f5f5; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #f0f0f0; border: 1px solid #ddd; padding: 10px; text-align: left; }
          .totals { text-align: right; margin-top: 20px; }
          .totals table { width: 300px; margin-left: auto; }
          .notes { margin-top: 30px; padding: 15px; background-color: #f9f9f9; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>Your Company Name</h1>
            <p>123 Business Street<br>City, State 12345<br>Phone: (555) 123-4567</p>
          </div>
          <div class="estimate-info">
            <h2>ESTIMATE</h2>
            <p><strong>Estimate #:</strong> ${data.estimate_number}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${data.valid_until ? `<p><strong>Valid Until:</strong> ${new Date(data.valid_until).toLocaleDateString()}</p>` : ''}
          </div>
        </div>

        ${data.customers ? `
        <div class="customer-info">
          <h3>Bill To:</h3>
          <p><strong>${data.customers.first_name} ${data.customers.last_name}</strong></p>
          ${data.customers.address ? `<p>${data.customers.address}</p>` : ''}
          ${data.customers.city || data.customers.state || data.customers.zip_code ? 
            `<p>${data.customers.city || ''} ${data.customers.state || ''} ${data.customers.zip_code || ''}</p>` : ''}
          ${data.customers.phone ? `<p>Phone: ${data.customers.phone}</p>` : ''}
          ${data.customers.email ? `<p>Email: ${data.customers.email}</p>` : ''}
        </div>
        ` : ''}

        <h3>${data.title}</h3>
        ${data.description ? `<p>${data.description}</p>` : ''}

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="width: 80px;">Qty</th>
              <th style="width: 100px;">Unit Price</th>
              <th style="width: 100px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHTML}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td style="text-align: right;"><strong>$${data.subtotal.toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td><strong>Tax (${(data.tax_rate * 100).toFixed(1)}%):</strong></td>
              <td style="text-align: right;"><strong>$${data.tax_amount.toFixed(2)}</strong></td>
            </tr>
            <tr style="border-top: 2px solid #000;">
              <td><strong>Total:</strong></td>
              <td style="text-align: right;"><strong>$${data.total_amount.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>

        ${data.notes ? `
        <div class="notes">
          <h4>Notes:</h4>
          <p>${data.notes}</p>
        </div>
        ` : ''}

        ${data.terms ? `
        <div class="notes">
          <h4>Terms & Conditions:</h4>
          <p>${data.terms}</p>
        </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  return {
    generateEstimatePDF,
    generating
  };
};
