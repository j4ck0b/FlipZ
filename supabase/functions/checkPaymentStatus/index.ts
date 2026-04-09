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

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return Response.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500, headers: corsHeaders });
    }
    const stripe = new Stripe(stripeSecretKey);

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

    // Klient serwisowy do DB
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { sessionId } = await req.json();
    if (!sessionId) {
      return Response.json({ error: 'Missing sessionId' }, { status: 400, headers: corsHeaders });
    }

    // Pobierz sesję ze Stripe i sprawdź status
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return Response.json({ success: false, paid: false }, { headers: corsHeaders });
    }

    const tradeOfferId = session.metadata?.trade_offer_id;
    const userEmail = session.metadata?.user_email;
    const escrowMode = session.metadata?.escrow_mode;
    const amount = (session.amount_total ?? 0) / 100;

    if (!tradeOfferId || !userEmail) {
      return Response.json({ success: false, paid: true, message: 'Not a trade payment' }, { headers: corsHeaders });
    }

    // Sprawdź czy płatność już istnieje (idempotentność)
    const { data: existingPayment } = await supabaseAdmin
      .from('trade_payments')
      .select('id')
      .eq('trade_offer_id', tradeOfferId)
      .eq('user_email', userEmail)
      .eq('payment_status', 'completed')
      .maybeSingle();

    if (existingPayment) {
      return Response.json({ success: true, paid: true, alreadyProcessed: true }, { headers: corsHeaders });
    }

    // Pobierz trade offer
    const { data: tradeOffer } = await supabaseAdmin
      .from('trade_offers')
      .select('*')
      .eq('id', tradeOfferId)
      .single();

    if (!tradeOffer) {
      return Response.json({ error: 'Trade offer not found' }, { status: 404, headers: corsHeaders });
    }

    const isSender = tradeOffer.sender_email === userEmail;
    const updateData: Record<string, unknown> = {};

    if (escrowMode) {
      updateData.escrow_mode = escrowMode;
    }

    // Aktualizuj tylko jeśli pole jeszcze nie ustawione (guard przed race condition)
    if (isSender && !tradeOffer.sender_paid) {
      updateData.sender_paid = true;
      updateData.sender_payment_id = session.payment_intent;
      updateData.sender_payment_date = new Date().toISOString();
    } else if (!isSender && !tradeOffer.owner_paid) {
      updateData.owner_paid = true;
      updateData.owner_payment_id = session.payment_intent;
      updateData.owner_payment_date = new Date().toISOString();
    }

    const bothPaid =
      (isSender && tradeOffer.owner_paid) ||
      (!isSender && tradeOffer.sender_paid);

    // Stadia które są 'bardziej zaawansowane' niż payment — nie cofaj postępu
    const laterStages = ['preparing_shipment', 'hub_verification', 'shipping_to_users', 'packages_delivered', 'completed'];
    const alreadyPastPayment = laterStages.includes(tradeOffer.progress_step ?? '');

    if (bothPaid && !alreadyPastPayment && !tradeOffer.both_paid) {
      updateData.both_paid = true;
      updateData.status = 'active';
      updateData.addresses_unlocked = true;
      updateData.progress_step = 'preparing_shipment';
    }

    await supabaseAdmin
      .from('trade_offers')
      .update(updateData)
      .eq('id', tradeOfferId);

    // Zapisz płatność
    await supabaseAdmin.from('trade_payments').insert({
      trade_offer_id: tradeOfferId,
      user_email: userEmail,
      protection_tier: escrowMode,
      total_amount: amount,
      payment_status: 'completed',
      stripe_session_id: session.id,
      payment_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      paid: true,
      bothPaid
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('checkPaymentStatus error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500, headers: corsHeaders }
    );
  }
});