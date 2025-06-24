
import jsPDF from 'jspdf';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLogoSettings } from './useLogoSettings';

export const usePDFGeneration = () => {
  const [generating, setGenerating] = useState(false);
  const { settings: logoSettings } = useLogoSettings();

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const addLogoToPDF = async (pdf: jsPDF, estimateStatus: string = 'draft') => {
    if (!logoSettings?.logo_url) return;

    const isDraft = estimateStatus === 'draft';
    const isApproved = estimateStatus === 'approved';

    // Check if logo should be shown based on status
    if (isDraft && !logoSettings.show_on_drafts) return;
    if (isApproved && !logoSettings.show_on_approved) return;

    try {
      const logoImg = await loadImage(logoSettings.logo_url);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Option A: Top-centered logo
      if (logoSettings.logo_position === 'top-center' || logoSettings.logo_position === 'both') {
        const logoX = (pageWidth - logoSettings.logo_width) / 2;
        pdf.addImage(
          logoImg,
          'PNG',
          logoX,
          10,
          logoSettings.logo_width,
          logoSettings.logo_height
        );
      }

      // Option B: Watermark background
      if (logoSettings.logo_position === 'watermark' || logoSettings.logo_position === 'both') {
        const watermarkSize = Math.min(pageWidth * 0.6, pageHeight * 0.6);
        const watermarkX = (pageWidth - watermarkSize) / 2;
        const watermarkY = (pageHeight - watermarkSize) / 2;

        // Set transparency
        pdf.setGState(pdf.GState({ opacity: logoSettings.watermark_opacity }));

        pdf.addImage(
          logoImg,
          'PNG',
          watermarkX,
          watermarkY,
          watermarkSize,
          watermarkSize * (logoSettings.logo_height / logoSettings.logo_width)
        );

        // Reset opacity for text
        pdf.setGState(pdf.GState({ opacity: 1.0 }));
      }

              // Logo added to PDF successfully
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
      // Silently fail - PDF generation continues without logo
    }
  };

  const generateEstimatePDF = async (estimate: any) => {
    setGenerating(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add logo first (if available)
      await addLogoToPDF(pdf, estimate.status);

      // Adjust starting Y position if top-centered logo is present
      let startY = 30;
      if (logoSettings?.logo_position === 'top-center' || logoSettings?.logo_position === 'both') {
        startY = 30 + logoSettings.logo_height + 10;
      }

      // Company branding (fallback text if no logo)
      if (!logoSettings?.logo_url) {
        pdf.setFontSize(20);
        pdf.setFont(undefined, 'bold');
        pdf.text('FINAL ROOFING & RETRO-FIT', 20, startY);
        startY += 10;
      }

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text('123 Business Street', 20, startY + 10);
      pdf.text('City, State 12345', 20, startY + 16);
      pdf.text('Phone: (555) 123-4567', 20, startY + 22);
      pdf.text('Email: info@finalroofing.com', 20, startY + 28);

      // Customer information (top-right)
      const customerName = estimate.customers ?
        `${estimate.customers.first_name} ${estimate.customers.last_name}` :
        'No Customer Assigned';

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('BILL TO:', pageWidth - 80, startY + 10);

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(customerName, pageWidth - 80, startY + 20);

      if (estimate.customers?.email) {
        pdf.text(estimate.customers.email, pageWidth - 80, startY + 26);
      }
      if (estimate.customers?.phone) {
        pdf.text(estimate.customers.phone, pageWidth - 80, startY + 32);
      }

      // Estimate header
      let currentY = startY + 50;
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('ESTIMATE', pageWidth / 2 - 15, currentY);
      currentY += 20;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Estimate #: ${estimate.estimate_number}`, 20, currentY);
      pdf.text(`Date: ${new Date(estimate.created_at).toLocaleDateString()}`, 20, currentY + 6);
      if (estimate.valid_until) {
        pdf.text(`Valid Until: ${new Date(estimate.valid_until).toLocaleDateString()}`, 20, currentY + 12);
      }

      // Title and description
      currentY += 30;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Title: ${estimate.title}`, 20, currentY);

      if (estimate.description) {
        currentY += 10;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const descriptionLines = pdf.splitTextToSize(estimate.description, pageWidth - 40);
        pdf.text(descriptionLines, 20, currentY);
        currentY += descriptionLines.length * 6;
      }

      // Line items table
      currentY += 20;

      // Table header
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Description', 20, currentY);
      pdf.text('Qty', pageWidth - 120, currentY);
      pdf.text('Unit Price', pageWidth - 80, currentY);
      pdf.text('Total', pageWidth - 40, currentY);

      // Header line
      pdf.line(20, currentY + 2, pageWidth - 20, currentY + 2);
      currentY += 10;

      // Line items
      pdf.setFont(undefined, 'normal');
      if (estimate.estimate_line_items && estimate.estimate_line_items.length > 0) {
        estimate.estimate_line_items.forEach((item: any) => {
          const descriptionLines = pdf.splitTextToSize(item.description, 100);
          pdf.text(descriptionLines, 20, currentY);
          pdf.text(item.quantity.toString(), pageWidth - 120, currentY);
          pdf.text(`$${Number(item.unit_price).toFixed(2)}`, pageWidth - 80, currentY);
          pdf.text(`$${Number(item.total).toFixed(2)}`, pageWidth - 40, currentY);
          currentY += Math.max(descriptionLines.length * 6, 10);
        });
      } else {
        pdf.text('No line items', 20, currentY);
        currentY += 10;
      }

      // Totals section
      currentY += 10;
      pdf.line(pageWidth - 100, currentY, pageWidth - 20, currentY);
      currentY += 8;

      const subtotal = estimate.subtotal || 0;
      const taxRate = estimate.tax_rate || 0;
      const taxAmount = estimate.tax_amount || 0;
      const totalAmount = estimate.total_amount || 0;

      pdf.text('Subtotal:', pageWidth - 80, currentY);
      pdf.text(`$${Number(subtotal).toFixed(2)}`, pageWidth - 40, currentY);
      currentY += 8;

      if (taxRate > 0) {
        pdf.text(`Tax (${(taxRate * 100).toFixed(1)}%):`, pageWidth - 80, currentY);
        pdf.text(`$${Number(taxAmount).toFixed(2)}`, pageWidth - 40, currentY);
        currentY += 8;
      }

      pdf.setFont(undefined, 'bold');
      pdf.text('Total:', pageWidth - 80, currentY);
      pdf.text(`$${Number(totalAmount).toFixed(2)}`, pageWidth - 40, currentY);

      // Terms and conditions
      if (estimate.terms) {
        currentY += 20;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Terms & Conditions:', 20, currentY);
        currentY += 8;

        pdf.setFont(undefined, 'normal');
        const termsLines = pdf.splitTextToSize(estimate.terms, pageWidth - 40);
        pdf.text(termsLines, 20, currentY);
        currentY += termsLines.length * 6;
      }

      // Notes
      if (estimate.notes) {
        currentY += 10;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Notes:', 20, currentY);
        currentY += 8;

        pdf.setFont(undefined, 'normal');
        const notesLines = pdf.splitTextToSize(estimate.notes, pageWidth - 40);
        pdf.text(notesLines, 20, currentY);
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
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add logo first (if available)
      await addLogoToPDF(pdf, invoice.status);

      // Adjust starting Y position if top-centered logo is present
      let startY = 30;
      if (logoSettings?.logo_position === 'top-center' || logoSettings?.logo_position === 'both') {
        startY = 30 + logoSettings.logo_height + 10;
      }

      // Company branding (fallback text if no logo)
      if (!logoSettings?.logo_url) {
        pdf.setFontSize(20);
        pdf.setFont(undefined, 'bold');
        pdf.text('FINAL ROOFING & RETRO-FIT', 20, startY);
        startY += 10;
      }

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text('123 Business Street', 20, startY + 10);
      pdf.text('City, State 12345', 20, startY + 16);
      pdf.text('Phone: (555) 123-4567', 20, startY + 22);
      pdf.text('Email: info@finalroofing.com', 20, startY + 28);

      // Customer information (top-right)
      const customerName = invoice.customers ?
        `${invoice.customers.first_name} ${invoice.customers.last_name}` :
        'No Customer Assigned';

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('BILL TO:', pageWidth - 80, startY + 10);

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(customerName, pageWidth - 80, startY + 20);

      if (invoice.customers?.email) {
        pdf.text(invoice.customers.email, pageWidth - 80, startY + 26);
      }
      if (invoice.customers?.phone) {
        pdf.text(invoice.customers.phone, pageWidth - 80, startY + 32);
      }

      // Invoice header
      let currentY = startY + 50;
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('INVOICE', pageWidth / 2 - 12, currentY);
      currentY += 20;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Invoice #: ${invoice.invoice_number}`, 20, currentY);
      pdf.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, currentY + 6);
      if (invoice.due_date) {
        pdf.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, currentY + 12);
      }
      pdf.text(`Status: ${invoice.status.toUpperCase()}`, 20, currentY + 18);

      // Title and description
      currentY += 35;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Title: ${invoice.title}`, 20, currentY);

      if (invoice.description) {
        currentY += 10;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const descriptionLines = pdf.splitTextToSize(invoice.description, pageWidth - 40);
        pdf.text(descriptionLines, 20, currentY);
        currentY += descriptionLines.length * 6;
      }

      // Line items table
      currentY += 20;

      // Table header
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Description', 20, currentY);
      pdf.text('Qty', pageWidth - 120, currentY);
      pdf.text('Unit Price', pageWidth - 80, currentY);
      pdf.text('Total', pageWidth - 40, currentY);

      // Header line
      pdf.line(20, currentY + 2, pageWidth - 20, currentY + 2);
      currentY += 10;

      // Line items
      pdf.setFont(undefined, 'normal');
      if (invoice.invoice_line_items && invoice.invoice_line_items.length > 0) {
        invoice.invoice_line_items.forEach((item: any) => {
          const descriptionLines = pdf.splitTextToSize(item.description, 100);
          pdf.text(descriptionLines, 20, currentY);
          pdf.text(item.quantity.toString(), pageWidth - 120, currentY);
          pdf.text(`$${Number(item.unit_price).toFixed(2)}`, pageWidth - 80, currentY);
          pdf.text(`$${Number(item.total).toFixed(2)}`, pageWidth - 40, currentY);
          currentY += Math.max(descriptionLines.length * 6, 10);
        });
      } else {
        pdf.text('No line items', 20, currentY);
        currentY += 10;
      }

      // Totals section
      currentY += 10;
      pdf.line(pageWidth - 100, currentY, pageWidth - 20, currentY);
      currentY += 8;

      const subtotal = invoice.subtotal || 0;
      const taxRate = invoice.tax_rate || 0;
      const taxAmount = invoice.tax_amount || 0;
      const totalAmount = invoice.total_amount || 0;

      pdf.text('Subtotal:', pageWidth - 80, currentY);
      pdf.text(`$${Number(subtotal).toFixed(2)}`, pageWidth - 40, currentY);
      currentY += 8;

      if (taxRate > 0) {
        pdf.text(`Tax (${(taxRate * 100).toFixed(1)}%):`, pageWidth - 80, currentY);
        pdf.text(`$${Number(taxAmount).toFixed(2)}`, pageWidth - 40, currentY);
        currentY += 8;
      }

      pdf.setFont(undefined, 'bold');
      pdf.text('Total Amount:', pageWidth - 80, currentY);
      pdf.text(`$${Number(totalAmount).toFixed(2)}`, pageWidth - 40, currentY);

      // Payment terms
      if (invoice.payment_terms) {
        currentY += 20;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Payment Terms:', 20, currentY);
        currentY += 8;

        pdf.setFont(undefined, 'normal');
        const termsLines = pdf.splitTextToSize(invoice.payment_terms, pageWidth - 40);
        pdf.text(termsLines, 20, currentY);
        currentY += termsLines.length * 6;
      }

      // Notes
      if (invoice.notes) {
        currentY += 10;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Notes:', 20, currentY);
        currentY += 8;

        pdf.setFont(undefined, 'normal');
        const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - 40);
        pdf.text(notesLines, 20, currentY);
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text('Thank you for your business!', pageWidth / 2 - 30, pageHeight - 20);

      // Save the PDF
      pdf.save(`invoice-${invoice.invoice_number}.pdf`);

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
