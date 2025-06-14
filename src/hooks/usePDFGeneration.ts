
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

interface InvoiceData {
  invoice_number: string;
  title: string;
  description?: string;
  due_date?: string;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_terms?: string;
  notes?: string;
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
  invoice_line_items?: Array<{
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
      const htmlContent = createEstimateHTML(estimateData);
      await printDocument(htmlContent, `Estimate-${estimateData.estimate_number}`);
      toast.success('Estimate PDF generated successfully');
    } catch (error: any) {
      console.error('Error generating estimate PDF:', error);
      toast.error('Failed to generate estimate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const generateInvoicePDF = async (invoiceData: InvoiceData) => {
    setGenerating(true);
    try {
      const htmlContent = createInvoiceHTML(invoiceData);
      await printDocument(htmlContent, `Invoice-${invoiceData.invoice_number}`);
      toast.success('Invoice PDF generated successfully');
    } catch (error: any) {
      console.error('Error generating invoice PDF:', error);
      toast.error('Failed to generate invoice PDF');
    } finally {
      setGenerating(false);
    }
  };

  const printDocument = async (htmlContent: string, filename: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const createEstimateHTML = (data: EstimateData): string => {
    const lineItemsHTML = data.estimate_line_items?.map(item => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${item.description}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${item.unit_price.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">$${item.total.toFixed(2)}</td>
      </tr>
    `).join('') || '';

    return createDocumentHTML({
      type: 'ESTIMATE',
      number: data.estimate_number,
      title: data.title,
      description: data.description,
      customer: data.customers,
      lineItems: lineItemsHTML,
      subtotal: data.subtotal,
      taxRate: data.tax_rate,
      taxAmount: data.tax_amount,
      total: data.total_amount,
      notes: data.notes,
      terms: data.terms,
      validUntil: data.valid_until,
      dueDate: undefined
    });
  };

  const createInvoiceHTML = (data: InvoiceData): string => {
    const lineItemsHTML = data.invoice_line_items?.map(item => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${item.description}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${item.unit_price.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">$${item.total.toFixed(2)}</td>
      </tr>
    `).join('') || '';

    return createDocumentHTML({
      type: 'INVOICE',
      number: data.invoice_number,
      title: data.title,
      description: data.description,
      customer: data.customers,
      lineItems: lineItemsHTML,
      subtotal: data.subtotal,
      taxRate: data.tax_rate,
      taxAmount: data.tax_amount,
      total: data.total_amount,
      notes: data.notes,
      terms: data.payment_terms,
      validUntil: undefined,
      dueDate: data.due_date
    });
  };

  const createDocumentHTML = (params: {
    type: 'ESTIMATE' | 'INVOICE';
    number: string;
    title: string;
    description?: string;
    customer?: any;
    lineItems: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes?: string;
    terms?: string;
    validUntil?: string;
    dueDate?: string;
  }): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${params.type} ${params.number}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 40px; 
            color: #333;
            line-height: 1.6;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 40px; 
            padding-bottom: 20px;
            border-bottom: 3px solid #3B82F6;
          }
          .company-info h1 { 
            color: #3B82F6; 
            margin: 0 0 10px 0; 
            font-size: 32px;
            font-weight: bold;
          }
          .company-info p { 
            margin: 0; 
            color: #666; 
            font-size: 14px;
          }
          .document-info { 
            text-align: right; 
            background: #F8FAFC;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3B82F6;
          }
          .document-info h2 { 
            color: #1E40AF; 
            margin: 0 0 15px 0; 
            font-size: 28px;
            font-weight: bold;
          }
          .document-info p { 
            margin: 5px 0; 
            font-size: 14px;
          }
          .customer-info { 
            background: #F1F5F9; 
            padding: 25px; 
            border-radius: 8px; 
            margin-bottom: 30px;
            border-left: 4px solid #10B981;
          }
          .customer-info h3 { 
            color: #059669; 
            margin: 0 0 15px 0; 
            font-size: 18px;
          }
          .customer-info p { 
            margin: 5px 0; 
            font-size: 14px;
          }
          .document-title {
            background: #EEF2FF;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
          }
          .document-title h3 {
            color: #3730A3;
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .document-title p {
            color: #6B7280;
            margin: 0;
            font-size: 14px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          th { 
            background: #3B82F6; 
            color: white;
            border: 1px solid #2563EB; 
            padding: 15px; 
            text-align: left; 
            font-weight: bold;
            font-size: 14px;
          }
          td {
            border: 1px solid #E5E7EB;
            padding: 12px;
            font-size: 14px;
          }
          tr:nth-child(even) {
            background-color: #F9FAFB;
          }
          .totals { 
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
          }
          .totals-table { 
            width: 350px; 
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .totals-table td {
            padding: 12px 20px;
            border-bottom: 1px solid #E5E7EB;
          }
          .totals-table .total-row {
            background: #1E40AF;
            color: white;
            font-weight: bold;
            font-size: 16px;
          }
          .total-row td {
            border-bottom: none;
          }
          .section { 
            margin-top: 40px; 
            padding: 25px; 
            background: #F8FAFC; 
            border-radius: 8px;
            border-left: 4px solid #6B7280;
          }
          .section h4 { 
            color: #374151; 
            margin: 0 0 15px 0; 
            font-size: 16px;
            font-weight: bold;
          }
          .section p { 
            color: #4B5563; 
            margin: 0; 
            line-height: 1.6;
            font-size: 14px;
          }
          @media print { 
            body { margin: 0; padding: 20px; } 
            .header { page-break-inside: avoid; }
            .totals-table { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>Your Company Name</h1>
            <p>123 Business Street<br>
            City, State 12345<br>
            Phone: (555) 123-4567<br>
            Email: info@yourcompany.com</p>
          </div>
          <div class="document-info">
            <h2>${params.type}</h2>
            <p><strong>${params.type === 'ESTIMATE' ? 'Estimate' : 'Invoice'} #:</strong> ${params.number}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${params.validUntil ? `<p><strong>Valid Until:</strong> ${new Date(params.validUntil).toLocaleDateString()}</p>` : ''}
            ${params.dueDate ? `<p><strong>Due Date:</strong> ${new Date(params.dueDate).toLocaleDateString()}</p>` : ''}
          </div>
        </div>

        ${params.customer ? `
        <div class="customer-info">
          <h3>${params.type === 'INVOICE' ? 'Bill To:' : 'Estimate For:'}</h3>
          <p><strong>${params.customer.first_name} ${params.customer.last_name}</strong></p>
          ${params.customer.address ? `<p>${params.customer.address}</p>` : ''}
          ${params.customer.city || params.customer.state || params.customer.zip_code ? 
            `<p>${params.customer.city || ''} ${params.customer.state || ''} ${params.customer.zip_code || ''}</p>` : ''}
          ${params.customer.phone ? `<p>Phone: ${params.customer.phone}</p>` : ''}
          ${params.customer.email ? `<p>Email: ${params.customer.email}</p>` : ''}
        </div>
        ` : ''}

        <div class="document-title">
          <h3>${params.title}</h3>
          ${params.description ? `<p>${params.description}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Description</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 17.5%; text-align: right;">Unit Price</th>
              <th style="width: 17.5%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${params.lineItems}
          </tbody>
        </table>

        <div class="totals">
          <table class="totals-table">
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td style="text-align: right;"><strong>$${params.subtotal.toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td><strong>Tax (${(params.taxRate * 100).toFixed(1)}%):</strong></td>
              <td style="text-align: right;"><strong>$${params.taxAmount.toFixed(2)}</strong></td>
            </tr>
            <tr class="total-row">
              <td><strong>Total:</strong></td>
              <td style="text-align: right;"><strong>$${params.total.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>

        ${params.notes ? `
        <div class="section">
          <h4>Notes:</h4>
          <p>${params.notes}</p>
        </div>
        ` : ''}

        ${params.terms ? `
        <div class="section">
          <h4>${params.type === 'INVOICE' ? 'Payment Terms:' : 'Terms & Conditions:'}</h4>
          <p>${params.terms}</p>
        </div>
        ` : ''}

        ${params.type === 'INVOICE' ? `
        <div class="section" style="border-left-color: #DC2626;">
          <h4 style="color: #DC2626;">Payment Information:</h4>
          <p>Please remit payment within the specified terms. Late payments may be subject to additional fees. 
          Thank you for your business!</p>
        </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  return {
    generateEstimatePDF,
    generateInvoicePDF,
    generating
  };
};
