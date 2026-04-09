import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.5.0';

const buildCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
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
  if (requestOrigin) return requestOrigin;

  const fallbackOrigin = Deno.env.get('APP_URL');
  if (fallbackOrigin) return fallbackOrigin.replace(/\/$/, '');

  return 'https://flipz.app';
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

    // Klient użytkownika — autentykowany tokenem JWT z headera
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // Klient serwisowy — do operacji uprzywilejowanych (update profilu)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    let { tier, amount, planName } = body;

    if (!tier) {
      return Response.json({ error: 'Missing tier' }, { status: 400, headers: corsHeaders });
    }

    // Sanitize amount (handle strings with commas)
    if (typeof amount === 'string') {
      amount = amount.replace(',', '.');
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return Response.json({ error: `Invalid amount: ${amount}` }, { status: 400, headers: corsHeaders });
    }

    // Pobierz profil użytkownika (stripe_customer_id może tam być)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name || user.email,
        metadata: {
          supabase_user_id: user.id,
          supabase_email: user.email
        }
      });

      customerId = customer.id;

      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const origin = getAppOrigin(req);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'], // Removed 'blik' for subscription stability
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: planName || `Subscription - ${tier}`,
              description: 'Miesięczny plan subskrypcyjny'
            },
            recurring: {
              interval: 'month'
            },
            unit_amount: Math.round(parsedAmount * 100)
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${origin}/subscription?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription?payment=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        subscription_tier: tier
      }
    });

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    console.error('createCheckoutSession error:', error);
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
