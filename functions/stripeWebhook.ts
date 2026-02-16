import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
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

const resolveUserByCustomerId = async (base44: ReturnType<typeof createClientFromRequest>, customerId: string) => {
  const users = await base44.asServiceRole.entities.User.filter({
    stripe_customer_id: customerId
  });

  return users[0] || null;
};

const getSubscriptionExpiryDate = (subscription: Stripe.Subscription) => {
  const unix = subscription.current_period_end;
  if (!unix) {
    return null;
  }

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
    const base44 = createClientFromRequest(req);
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
        const userId = session.metadata?.base44_user_id;
        const tier = session.metadata?.subscription_tier;

        if (!userId || !tier) {
          break;
        }

        let expiryDate: string | null = null;

        if (session.subscription && typeof session.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          expiryDate = getSubscriptionExpiryDate(subscription);
        }

        await base44.asServiceRole.entities.User.update(userId, {
          subscription_tier: tier,
          subscription_expiry_date: expiryDate
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = String(subscription.customer);
        const user = await resolveUserByCustomerId(base44, customerId);

        if (!user) {
          break;
        }

        await base44.asServiceRole.entities.User.update(user.id, {
          subscription_expiry_date: getSubscriptionExpiryDate(subscription)
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = String(subscription.customer);
        const user = await resolveUserByCustomerId(base44, customerId);

        if (!user) {
          break;
        }

        await base44.asServiceRole.entities.User.update(user.id, {
          subscription_tier: 'free',
          subscription_expiry_date: null
        });

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
