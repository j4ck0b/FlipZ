import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { tradeOfferId } = await req.json();

    if (!tradeOfferId) {
      return Response.json({ error: 'Trade offer ID is required' }, { status: 400, headers: corsHeaders });
    }

    // Fetch the trade offer
    const offers = await base44.entities.TradeOffer.filter({ id: tradeOfferId });
    if (offers.length === 0) {
      return Response.json({ error: 'Trade offer not found' }, { status: 404, headers: corsHeaders });
    }

    const offer = offers[0];

    // Check if user is part of this trade
    const isParticipant = 
      offer.sender_email === user.email || 
      offer.owner_email === user.email;

    if (!isParticipant) {
      return Response.json({ 
        canCancel: false, 
        reason: 'You are not a participant in this trade' 
      }, { headers: corsHeaders });
    }

    // Cannot cancel if both parties have paid
    if (offer.both_paid || (offer.sender_paid && offer.owner_paid)) {
      return Response.json({ 
        canCancel: false, 
        reason: 'Cannot cancel - both parties have paid for shipping' 
      }, { headers: corsHeaders });
    }

    // Cannot cancel if already completed or cancelled
    if (['completed', 'cancelled', 'failed'].includes(offer.status)) {
      return Response.json({ 
        canCancel: false, 
        reason: `Trade is already ${offer.status}` 
      }, { headers: corsHeaders });
    }

    // Can cancel if:
    // - Status is pending or accepted
    // - At least one party hasn't paid yet
    if (['pending', 'accepted'].includes(offer.status)) {
      return Response.json({ 
        canCancel: true, 
        reason: 'Trade can be cancelled' 
      }, { headers: corsHeaders });
    }

    // Default: cannot cancel
    return Response.json({ 
      canCancel: false, 
      reason: 'Trade cannot be cancelled at this stage' 
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error checking cancellation:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});