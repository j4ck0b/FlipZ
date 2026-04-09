import { createClient } from 'npm:@supabase/supabase-js@2';

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

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  try {
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

    const body = await req.json();
    const { tradeOfferId, reason } = body;

    if (!tradeOfferId) {
      return Response.json({ error: 'Trade offer ID is required' }, { status: 400, headers: corsHeaders });
    }

    // Pobierz ofertę wymiany
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('trade_offers')
      .select('*')
      .eq('id', tradeOfferId)
      .single();

    if (offerError || !offer) {
      return Response.json({ error: 'Trade offer not found' }, { status: 404, headers: corsHeaders });
    }

    // Sprawdź czy użytkownik jest uczestnikiem wymiany
    const isParticipant =
      offer.sender_email === user.email ||
      offer.owner_email === user.email ||
      offer.sender_id === user.id ||
      offer.owner_id === user.id;

    if (!isParticipant) {
      return Response.json({ error: 'You are not a participant in this trade' }, { status: 403, headers: corsHeaders });
    }

    // Walidacja: nie można anulować jeśli obie strony już zapłaciły
    if (offer.both_paid || (offer.sender_paid && offer.owner_paid)) {
      return Response.json({
        error: 'Cannot cancel - both parties have already paid. Please contact support.'
      }, { status: 400, headers: corsHeaders });
    }

    // Walidacja: nie można anulować już zakończonej/anulowanej wymiany
    if (['completed', 'cancelled', 'failed'].includes(offer.status)) {
      return Response.json({ error: `Trade is already ${offer.status}` }, { status: 400, headers: corsHeaders });
    }

    // Walidacja: można anulować tylko wymiany w toku (pending/accepted)
    if (!['pending', 'accepted'].includes(offer.status)) {
      return Response.json({ error: 'Trade cannot be cancelled at this stage' }, { status: 400, headers: corsHeaders });
    }

    // Zaktualizuj status oferty do "cancelled"
    const { error: updateError } = await supabaseAdmin
      .from('trade_offers')
      .update({
        status: 'cancelled',
        cancelled_by: user.email,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || 'Cancelled by user',
        progress_step: 'cancelled'
      })
      .eq('id', tradeOfferId);

    if (updateError) {
      console.error('Error updating trade offer:', updateError);
      return Response.json({ error: 'Failed to cancel trade offer' }, { status: 500, headers: corsHeaders });
    }

    // Przywróć dostępność kart
    if (offer.requested_card_id) {
      await supabaseAdmin
        .from('card_listings')
        .update({ status: 'available' })
        .eq('id', offer.requested_card_id);
    }

    for (const cardId of offer.offered_card_ids || []) {
      await supabaseAdmin
        .from('card_listings')
        .update({ status: 'available' })
        .eq('id', cardId);
    }

    return Response.json({ success: true, message: 'Trade cancelled successfully' }, { headers: corsHeaders });

  } catch (error) {
    console.error('cancelTrade error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500, headers: corsHeaders }
    );
  }
});