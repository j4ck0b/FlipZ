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

    const { tradeOfferId, escrowMode, declaredValue = 0 } = await req.json();

    if (!tradeOfferId || !escrowMode) {
      return Response.json({ error: 'Missing required fields: tradeOfferId, escrowMode' }, { status: 400, headers: corsHeaders });
    }

    // Pobierz profil użytkownika i subskrypcję
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, full_name, subscription_tier')
      .eq('id', user.id)
      .single();

    // Mapowanie cennika Swiss Safe Hub
    // 1. Standard Escrow: 45 zł
    // 2. Swiss Safe: 69 zł
    // 3. Vault Black: 99 zł (lub 3% powyżej 3000 zł)
    const normalizedMode = (escrowMode || '').toLowerCase();
    let baseAmount = 45;
    let tierName = 'Standard Escrow';

    if (normalizedMode === 'swiss_safe' || normalizedMode === 'secure' || normalizedMode === 'light') {
      baseAmount = 69;
      tierName = 'Swiss Safe';
    } else if (normalizedMode === 'vault_black' || normalizedMode === 'collector' || normalizedMode === 'full') {
      const numericDeclaredValue = Number(declaredValue) || 0;
      if (numericDeclaredValue > 3000) {
        baseAmount = Math.max(99, Math.round(numericDeclaredValue * 0.03));
      } else {
        baseAmount = 99;
      }
      tierName = 'Vault Black (High-End)';
    } else {
      baseAmount = 45;
      tierName = 'Standard Escrow';
    }

    // Naliczanie zniżki subskrypcyjnej
    const userTier = profile?.subscription_tier || 'free';
    let discountPercent = 0;
    if (userTier === 'vault_master' || userTier === 'premium') {
      discountPercent = 20; // -20%
    } else if (userTier === 'pro' || userTier === 'basic') {
      discountPercent = 10; // -10%
    }

    const discountedEscrowFee = Number((baseAmount * (1 - discountPercent / 100)).toFixed(2));

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

    const lineItems: any[] = [
      {
        price_data: {
          currency: 'pln',
          product_data: {
            name: `FlipZ Swiss Safe Hub: ${tierName}`,
            description: discountPercent > 0 
              ? `Opłata weryfikacyjna Escrow z rabatem subskrypcyjnym ${discountPercent}% (${userTier})` 
              : 'Laboratoryjna inspekcja NDT, etykiety InPost, łańcuch dowodowy SHA-256'
          },
          unit_amount: Math.round(discountedEscrowFee * 100)
        },
        quantity: 1
      }
    ];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'blik'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/my-listings?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/my-listings?payment=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        trade_offer_id: String(tradeOfferId),
        escrow_mode: normalizedMode,
        escrow_fee: String(discountedEscrowFee),
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
