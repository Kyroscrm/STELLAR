
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { invoiceId } = await req.json();
    if (!invoiceId) throw new Error("Invoice ID is required");
    logStep("Invoice ID received", { invoiceId });

    // Fetch invoice with validation
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error("Invoice not found or access denied");
    }
    logStep("Invoice retrieved", { invoiceNumber: invoice.invoice_number, total: invoice.total_amount });

    if (invoice.payment_status === 'paid') {
      throw new Error("Invoice is already paid");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      logStep("No existing Stripe customer found");
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "payment",
      success_url: `${origin}/admin/invoices?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/admin/invoices?payment=cancelled`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round((invoice.total_amount || 0) * 100),
            product_data: {
              name: `Invoice #${invoice.invoice_number}`,
              description: invoice.description || "Service payment",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoice_id: invoice.id,
        user_id: user.id,
      },
    });

    logStep("Stripe checkout session created", { sessionId: session.id });

    // Update invoice with Stripe session ID
    await supabaseClient
      .from("invoices")
      .update({ 
        stripe_session_id: session.id,
        payment_status: 'pending'
      })
      .eq("id", invoiceId)
      .eq("user_id", user.id);

    logStep("Invoice updated with session ID");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-stripe-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
