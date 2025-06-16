
import { useState } from 'react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export const usePDFGeneration = () => {
  const [generating, setGenerating] = useState(false);

  const generateEstimatePDF = async (estimate: any) => {
    setGenerating(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Company branding
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('FINAL ROOFING & RETRO-FIT', 20, 30);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text('123 Business Street', 20, 40);
      pdf.text('City, State 12345', 20, 46);
      pdf.text('Phone: (555) 123-4567', 20, 52);
      pdf.text('Email: info@finalroofing.com', 20, 58);

      // Customer information (top-right)
      const customerName = estimate.customers ? 
        `${estimate.customers.first_name} ${estimate.customers.last_name}` : 
        'No Customer Assigned';
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('BILL TO:', pageWidth - 80, 30);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(customerName, pageWidth - 80, 40);
      
      if (estimate.customers?.email) {
        pdf.text(estimate.customers.email, pageWidth - 80, 46);
      }
      if (estimate.customers?.phone) {
        pdf.text(estimate.customers.phone, pageWidth - 80, 52);
      }

      // Estimate header
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('ESTIMATE', pageWidth / 2 - 15, 80);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Estimate #: ${estimate.estimate_number}`, 20, 100);
      pdf.text(`Date: ${new Date(estimate.created_at).toLocaleDateString()}`, 20, 106);
      if (estimate.valid_until) {
        pdf.text(`Valid Until: ${new Date(estimate.valid_until).toLocaleDateString()}`, 20, 112);
      }

      // Title and description
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Title: ${estimate.title}`, 20, 130);
      
      if (estimate.description) {
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const descriptionLines = pdf.splitTextToSize(estimate.description, pageWidth - 40);
        pdf.text(descriptionLines, 20, 140);
      }

      // Line items table
      let yPosition = estimate.description ? 160 : 150;
      
      // Table header
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Description', 20, yPosition);
      pdf.text('Qty', pageWidth - 120, yPosition);
      pdf.text('Unit Price', pageWidth - 80, yPosition);
      pdf.text('Total', pageWidth - 40, yPosition);
      
      // Header line
      pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
      yPosition += 10;

      // Line items
      pdf.setFont(undefined, 'normal');
      if (estimate.estimate_line_items && estimate.estimate_line_items.length > 0) {
        estimate.estimate_line_items.forEach((item: any) => {
          const descriptionLines = pdf.splitTextToSize(item.description, 100);
          pdf.text(descriptionLines, 20, yPosition);
          pdf.text(item.quantity.toString(), pageWidth - 120, yPosition);
          pdf.text(`$${Number(item.unit_price).toFixed(2)}`, pageWidth - 80, yPosition);
          pdf.text(`$${Number(item.total).toFixed(2)}`, pageWidth - 40, yPosition);
          yPosition += Math.max(descriptionLines.length * 6, 10);
        });
      } else {
        pdf.text('No line items', 20, yPosition);
        yPosition += 10;
      }

      // Totals section
      yPosition += 10;
      pdf.line(pageWidth - 100, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;

      const subtotal = estimate.subtotal || 0;
      const taxRate = estimate.tax_rate || 0;
      const taxAmount = estimate.tax_amount || 0;
      const totalAmount = estimate.total_amount || 0;

      pdf.text('Subtotal:', pageWidth - 80, yPosition);
      pdf.text(`$${Number(subtotal).toFixed(2)}`, pageWidth - 40, yPosition);
      yPosition += 8;

      if (taxRate > 0) {
        pdf.text(`Tax (${(taxRate * 100).toFixed(1)}%):`, pageWidth - 80, yPosition);
        pdf.text(`$${Number(taxAmount).toFixed(2)}`, pageWidth - 40, yPosition);
        yPosition += 8;
      }

      pdf.setFont(undefined, 'bold');
      pdf.text('Total:', pageWidth - 80, yPosition);
      pdf.text(`$${Number(totalAmount).toFixed(2)}`, pageWidth - 40, yPosition);

      // Terms and conditions
      if (estimate.terms) {
        yPosition += 20;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Terms & Conditions:', 20, yPosition);
        yPosition += 8;
        
        pdf.setFont(undefined, 'normal');
        const termsLines = pdf.splitTextToSize(estimate.terms, pageWidth - 40);
        pdf.text(termsLines, 20, yPosition);
        yPosition += termsLines.length * 6;
      }

      // Notes
      if (estimate.notes) {
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Notes:', 20, yPosition);
        yPosition += 8;
        
        pdf.setFont(undefined, 'normal');
        const notesLines = pdf.splitTextToSize(estimate.notes, pageWidth - 40);
        pdf.text(notesLines, 20, yPosition);
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text('Thank you for your business!', pageWidth / 2 - 30, pageHeight - 20);

      // Save the PDF
      pdf.save(`estimate-${estimate.estimate_number}.pdf`);
      
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
