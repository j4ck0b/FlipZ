import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.5.0';

const buildCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
};

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!stripeSecretKey || !webhookSecret) {
    console.error('Missing Stripe environment variables');
    return new Response('Configuration error', { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(stripeSecretKey);
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400, headers: corsHeaders });
  }

  let event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400, headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const tier = session.metadata?.subscription_tier;

        if (!userId || !tier) {
          console.error('Missing metadata in session:', session.id);
          break;
        }

        // Ustawiamy datę wygaśnięcia na za 31 dni (bufor)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 31);

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_expiry_date: expiryDate.toISOString(),
            stripe_customer_id: session.customer as string
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }

        console.log(`Successfully updated subscription for user ${userId} to ${tier}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_expiry_date: null
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error reverting subscription:', error);
          throw error;
        }

        console.log(`Subscription deleted for customer ${customerId}, reverted to free tier`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook handler failed', { status: 500, headers: corsHeaders });
  }
});
