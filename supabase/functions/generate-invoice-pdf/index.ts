
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { invoiceId } = await req.json();

    // Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          zip_code,
          company_name
        )
      `)
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch line items
    const { data: lineItems } = await supabaseClient
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('sort_order');

    // Generate PDF content (simple HTML for now, can be enhanced with proper PDF generation)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          .customer-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .totals { text-align: right; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Final Roofing & Retro-Fit</h1>
          <h2>INVOICE</h2>
        </div>
        
        <div class="invoice-details">
          <strong>Invoice #:</strong> ${invoice.invoice_number}<br>
          <strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}<br>
          <strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
        </div>
        
        <div class="customer-info">
          <h3>Bill To:</h3>
          ${invoice.customers?.company_name ? `<strong>${invoice.customers.company_name}</strong><br>` : ''}
          ${invoice.customers?.first_name} ${invoice.customers?.last_name}<br>
          ${invoice.customers?.address ? `${invoice.customers.address}<br>` : ''}
          ${invoice.customers?.city ? `${invoice.customers.city}, ` : ''}${invoice.customers?.state} ${invoice.customers?.zip_code}<br>
          ${invoice.customers?.email ? `Email: ${invoice.customers.email}<br>` : ''}
          ${invoice.customers?.phone ? `Phone: ${invoice.customers.phone}` : ''}
        </div>
        
        <h3>${invoice.title}</h3>
        ${invoice.description ? `<p>${invoice.description}</p>` : ''}
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems?.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${Number(item.unit_price).toFixed(2)}</td>
                <td>$${Number(item.total).toFixed(2)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
        
        <div class="totals">
          <p><strong>Subtotal:</strong> $${Number(invoice.subtotal).toFixed(2)}</p>
          <p><strong>Tax (${Number(invoice.tax_rate * 100).toFixed(1)}%):</strong> $${Number(invoice.tax_amount).toFixed(2)}</p>
          <p class="total-row"><strong>Total:</strong> $${Number(invoice.total_amount).toFixed(2)}</p>
        </div>
        
        ${invoice.notes ? `<div><h3>Notes:</h3><p>${invoice.notes}</p></div>` : ''}
        ${invoice.payment_terms ? `<div><h3>Payment Terms:</h3><p>${invoice.payment_terms}</p></div>` : ''}
      </body>
      </html>
    `;

    // For now, return HTML content
    // In production, you would use a PDF generation library like Puppeteer
    return new Response(JSON.stringify({ 
      html: htmlContent,
      filename: `invoice-${invoice.invoice_number}.html` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
