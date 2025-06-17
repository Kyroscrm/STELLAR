
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get the raw body and headers for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify the webhook signature (optional - for production use)
    // const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    // if (endpointSecret) {
    //   stripe.webhooks.constructEvent(body, signature, endpointSecret);
    // }

    const event = JSON.parse(body);
    logStep("Event type received", { type: event.type });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Processing checkout session", { sessionId: session.id });

      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Find the invoice by stripe_session_id
      const { data: invoice, error: invoiceError } = await supabaseClient
        .from("invoices")
        .select("*")
        .eq("stripe_session_id", session.id)
        .single();

      if (invoiceError || !invoice) {
        logStep("Invoice not found", { sessionId: session.id, error: invoiceError });
        throw new Error(`Invoice not found for session ${session.id}`);
      }

      logStep("Invoice found", { invoiceId: invoice.id, invoiceNumber: invoice.invoice_number });

      // Update invoice status to paid
      const { error: updateError } = await supabaseClient
        .from("invoices")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString()
        })
        .eq("id", invoice.id);

      if (updateError) {
        logStep("Error updating invoice", { error: updateError });
        throw updateError;
      }

      logStep("Invoice updated to paid", { invoiceId: invoice.id });

      // Log activity
      await supabaseClient.from("activity_logs").insert({
        user_id: invoice.user_id,
        entity_type: "invoice",
        entity_id: invoice.id,
        action: "payment_completed",
        description: `Payment completed for invoice ${invoice.invoice_number} via Stripe`
      });

      // Trigger receipt email
      try {
        const { error: emailError } = await supabaseClient.functions.invoke('send-receipt-email', {
          body: { 
            invoiceId: invoice.id,
            stripeSessionId: session.id 
          }
        });

        if (emailError) {
          logStep("Error sending receipt email", { error: emailError });
        } else {
          logStep("Receipt email sent successfully");
        }
      } catch (emailError) {
        logStep("Failed to send receipt email", { error: emailError });
        // Don't fail the webhook for email errors
      }

      logStep("Webhook processing completed successfully");
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook handler", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
