
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-RECEIPT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Receipt email request received");

    const { invoiceId, stripeSessionId } = await req.json();
    if (!invoiceId) throw new Error("Invoice ID is required");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch invoice with customer and line items
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        customers(first_name, last_name, email),
        invoice_line_items(*)
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message}`);
    }

    if (!invoice.customers?.email) {
      throw new Error("Customer email not found");
    }

    logStep("Invoice data retrieved", { 
      invoiceNumber: invoice.invoice_number,
      customerEmail: invoice.customers.email 
    });

    // Generate receipt HTML
    const receiptHTML = generateReceiptHTML(invoice);

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Invoices <onboarding@resend.dev>",
      to: [invoice.customers.email],
      subject: `Payment Receipt - Invoice ${invoice.invoice_number}`,
      html: receiptHTML,
    });

    logStep("Receipt email sent", { emailId: emailResponse.data?.id });

    // Log activity
    await supabaseClient.from("activity_logs").insert({
      user_id: invoice.user_id,
      entity_type: "invoice",
      entity_id: invoice.id,
      action: "receipt_sent",
      description: `Payment receipt sent to ${invoice.customers.email}`
    });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR sending receipt", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function generateReceiptHTML(invoice: any): string {
  const customerName = `${invoice.customers.first_name} ${invoice.customers.last_name}`;
  const lineItems = invoice.invoice_line_items || [];
  
  const lineItemsHTML = lineItems.map((item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.description}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.unit_price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin-bottom: 5px;">Payment Receipt</h1>
        <p style="color: #666; margin: 0;">Thank you for your payment!</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="margin-top: 0; color: #2563eb;">Invoice Details</h2>
        <table style="width: 100%;">
          <tr>
            <td><strong>Invoice Number:</strong></td>
            <td>${invoice.invoice_number}</td>
          </tr>
          <tr>
            <td><strong>Customer:</strong></td>
            <td>${customerName}</td>
          </tr>
          <tr>
            <td><strong>Payment Date:</strong></td>
            <td>${new Date(invoice.paid_at).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td><strong>Payment Status:</strong></td>
            <td style="color: #22c55e; font-weight: bold;">PAID</td>
          </tr>
        </table>
      </div>

      ${lineItems.length > 0 ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #2563eb;">Line Items</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHTML}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px; text-align: center;">
        <h3 style="margin: 0 0 10px 0;">Total Amount Paid</h3>
        <div style="font-size: 24px; font-weight: bold;">$${(invoice.total_amount || 0).toFixed(2)}</div>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
        <p>If you have any questions about this payment, please contact us.</p>
        <p style="margin: 0;">Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;
}
