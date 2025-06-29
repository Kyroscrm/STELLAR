import jsPDF from 'jspdf';
import type { LogoSettings, Estimate, Invoice } from '@/types/app-types';

// Define LineItem interface locally for PDF generation
interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order?: number;
}

// Define extended types for PDF generation
interface EstimateWithLineItems extends Estimate {
  estimate_line_items?: LineItem[];
  line_items?: LineItem[];
  customer?: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
}

interface InvoiceWithLineItems extends Invoice {
  invoice_line_items?: LineItem[];
  line_items?: LineItem[];
  customer?: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
}

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

const addLogoToPDF = async (pdf: jsPDF, logoSettings: LogoSettings | null, estimateStatus: string = 'draft') => {
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

  } catch (error: unknown) {
    // Logo addition fails silently, PDF generation continues
    // This prevents the entire PDF generation from failing
  }
};

export const generateEstimatePDF = async (estimate: EstimateWithLineItems, logoSettings: LogoSettings | null) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add logo first (if available)
  await addLogoToPDF(pdf, logoSettings, estimate.status);

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
  const customerName = estimate.customer ?
    `${estimate.customer.first_name} ${estimate.customer.last_name}` :
    'No Customer Assigned';

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('BILL TO:', pageWidth - 80, startY + 10);

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(customerName, pageWidth - 80, startY + 20);

  if (estimate.customer?.email) {
    pdf.text(estimate.customer.email, pageWidth - 80, startY + 26);
  }
  if (estimate.customer?.phone) {
    pdf.text(estimate.customer.phone, pageWidth - 80, startY + 32);
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

  // Handle both possible field names for line items
  const lineItems = estimate.estimate_line_items || estimate.line_items;

  if (lineItems && lineItems.length > 0) {
    lineItems.forEach((item: LineItem) => {
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
};

export const generateInvoicePDF = async (invoice: InvoiceWithLineItems, logoSettings: LogoSettings | null) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add logo first (if available)
  await addLogoToPDF(pdf, logoSettings, 'approved');

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
  const customerName = invoice.customer ?
    `${invoice.customer.first_name} ${invoice.customer.last_name}` :
    'No Customer Assigned';

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('BILL TO:', pageWidth - 80, startY + 10);

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(customerName, pageWidth - 80, startY + 20);

  if (invoice.customer?.email) {
    pdf.text(invoice.customer.email, pageWidth - 80, startY + 26);
  }
  if (invoice.customer?.phone) {
    pdf.text(invoice.customer.phone, pageWidth - 80, startY + 32);
  }

  // Invoice header
  let currentY = startY + 50;
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('INVOICE', pageWidth / 2 - 15, currentY);
  currentY += 20;

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Invoice #: ${invoice.invoice_number}`, 20, currentY);
  pdf.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, currentY + 6);
  if (invoice.due_date) {
    pdf.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, currentY + 12);
  }

  // Title and description
  currentY += 30;
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

  // Handle both possible field names for line items
  const lineItems = invoice.invoice_line_items || invoice.line_items;

  if (lineItems && lineItems.length > 0) {
    lineItems.forEach((item: LineItem) => {
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
  pdf.text('Total:', pageWidth - 80, currentY);
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
};
