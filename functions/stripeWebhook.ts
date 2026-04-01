import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.5.0';

const buildCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'stripe-signature, content-type, authorization, x-client-info, apikey',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
};

const getStripeConfig = () => {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!stripeSecretKey) {
    return { error: 'Missing STRIPE_SECRET_KEY environment variable' };
  }
  if (!webhookSecret) {
    return { error: 'Missing STRIPE_WEBHOOK_SECRET environment variable' };
  }

  return {
    stripe: new Stripe(stripeSecretKey),
    webhookSecret
  };
};

const getSubscriptionExpiryDate = (subscription: Stripe.Subscription) => {
  const unix = subscription.current_period_end;
  if (!unix) return null;
  return new Date(unix * 1000).toISOString();
};

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  try {
    const config = getStripeConfig();
    if ('error' in config) {
      return Response.json({ error: config.error }, { status: 500, headers: corsHeaders });
    }

    const { stripe, webhookSecret } = config;

    // Klient serwisowy do wszystkich operacji DB w webhookach
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'Missing stripe-signature header' }, { status: 400, headers: corsHeaders });
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid webhook signature';
      return Response.json({ error: message }, { status: 400, headers: corsHeaders });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const tier = session.metadata?.subscription_tier;
        const tradeOfferId = session.metadata?.trade_offer_id;
        const userEmail = session.metadata?.user_email;
        const escrowMode = session.metadata?.escrow_mode;

        // --- Obsługa subskrypcji ---
        if (userId && tier && !tradeOfferId) {
          let expiryDate: string | null = null;

          if (session.subscription && typeof session.subscription === 'string') {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            expiryDate = getSubscriptionExpiryDate(subscription);
          }

          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_tier: tier,
              subscription_expiry_date: expiryDate
            })
            .eq('id', userId);
        }

        // --- Obsługa płatności za trade ---
        if (tradeOfferId && userEmail) {
          const amount = (session.amount_total ?? 0) / 100;

          const { data: tradeOffer } = await supabaseAdmin
            .from('trade_offers')
            .select('*')
            .eq('id', tradeOfferId)
            .single();

          if (tradeOffer) {
            const isSender = tradeOffer.sender_email === userEmail;
            const updateData: Record<string, unknown> = {
              escrow_mode: escrowMode
            };

            if (isSender) {
              updateData.sender_paid = true;
              updateData.sender_payment_id = session.payment_intent;
              updateData.sender_payment_date = new Date().toISOString();
            } else {
              updateData.owner_paid = true;
              updateData.owner_payment_id = session.payment_intent;
              updateData.owner_payment_date = new Date().toISOString();
            }

            const bothPaid =
              (isSender && tradeOffer.owner_paid) ||
              (!isSender && tradeOffer.sender_paid);

            if (bothPaid) {
              updateData.both_paid = true;
              updateData.status = 'active';
              updateData.addresses_unlocked = true;
              updateData.progress_step = 'preparing_shipment';
            }

            await supabaseAdmin
              .from('trade_offers')
              .update(updateData)
              .eq('id', tradeOfferId);

            // Zapisz rekord płatności
            await supabaseAdmin.from('trade_payments').insert({
              trade_offer_id: tradeOfferId,
              user_email: userEmail,
              protection_tier: escrowMode,
              total_amount: amount,
              payment_status: 'completed',
              stripe_session_id: session.id,
              payment_date: new Date().toISOString()
            });
          }
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = String(subscription.customer);

        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId);

        if (profiles && profiles.length > 0) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_expiry_date: getSubscriptionExpiryDate(subscription) })
            .eq('stripe_customer_id', customerId);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = String(subscription.customer);

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_expiry_date: null
          })
          .eq('stripe_customer_id', customerId);

        break;
      }

      default:
        break;
    }

    return Response.json({ received: true }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected webhook error';
    console.error('stripeWebhook error:', error);
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
