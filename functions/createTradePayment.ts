import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const buildCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
};

const getStripeClient = () => {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeSecretKey) {
    return { error: 'Missing STRIPE_SECRET_KEY environment variable' };
  }

  return { stripe: new Stripe(stripeSecretKey) };
};

const getAppOrigin = (req: Request) => {
  const requestOrigin = req.headers.get('origin');
  if (requestOrigin) {
    return requestOrigin;
  }

  const fallbackOrigin = Deno.env.get('APP_URL');
  if (fallbackOrigin) {
    return fallbackOrigin.replace(/\/$/, '');
  }

  return 'https://app.base44.app';
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
    const stripeResult = getStripeClient();
    if ('error' in stripeResult) {
      return Response.json({ error: stripeResult.error }, { status: 500, headers: corsHeaders });
    }

    const { stripe } = stripeResult;
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { tradeOfferId, escrowMode, amount } = await req.json();

    const parsedAmount = Number(amount);
    if (!tradeOfferId || !escrowMode || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return Response.json({ error: 'Missing or invalid required fields' }, { status: 400, headers: corsHeaders });
    }

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          base44_user_id: user.id,
          base44_email: user.email
        }
      });

      customerId = customer.id;

      await base44.asServiceRole.entities.User.update(user.id, {
        stripe_customer_id: customerId
      });
    }

    const origin = getAppOrigin(req);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'blik'],
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: `Escrow Protection - ${escrowMode} Mode`,
              description: 'Secure trade verification and protection'
            },
            unit_amount: Math.round(parsedAmount * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${origin}/my-listings?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/my-listings?payment=cancelled`,
      metadata: {
        base44_user_id: user.id,
        trade_offer_id: tradeOfferId,
        escrow_mode: escrowMode,
        user_email: user.email
      }
    });

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected payment error';
    console.error('Payment error:', error);
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
