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

    // Autentykacja użytkownika przez JWT
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

    // Klient serwisowy do uprzywilejowanych operacji na DB
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { tradeOfferId, escrowMode } = await req.json();

    if (!tradeOfferId || !escrowMode) {
      return Response.json({ error: 'Missing required fields: tradeOfferId, escrowMode' }, { status: 400, headers: corsHeaders });
    }

    // Ceny escrow walidowane po stronie serwera — klient nie może manipulować kwotą
    const ESCROW_PRICES: Record<string, number> = {
      eco: 24,
      light: 39,
      full: 59
    };

    const serverAmount = ESCROW_PRICES[escrowMode];
    if (serverAmount === undefined) {
      return Response.json({ error: `Invalid escrow mode: ${escrowMode}. Allowed: eco, light, full` }, { status: 400, headers: corsHeaders });
    }


    // Pobierz profil użytkownika
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
      payment_method_types: ['card', 'blik'],
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: `Ochrona Escrow - Tryb ${escrowMode.toUpperCase()}`,
              description: 'Zabezpieczona weryfikacja i ochrona transakcji'
            },
            unit_amount: Math.round(serverAmount * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${origin}/my-listings?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/my-listings?payment=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        trade_offer_id: String(tradeOfferId),
        escrow_mode: escrowMode,
        user_email: user.email
      }
    });
    console.log('Session created:', session.id);

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected payment error';
    console.error('createTradePayment error:', error);
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
