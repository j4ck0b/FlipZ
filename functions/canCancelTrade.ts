import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tradeOfferId } = await req.json();

    if (!tradeOfferId) {
      return Response.json({ error: 'Trade offer ID is required' }, { status: 400 });
    }

    // Fetch the trade offer
    const offers = await base44.entities.TradeOffer.filter({ id: tradeOfferId });
    if (offers.length === 0) {
      return Response.json({ error: 'Trade offer not found' }, { status: 404 });
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
      });
    }

    // Cannot cancel if both parties have paid
    if (offer.both_paid || (offer.sender_paid && offer.owner_paid)) {
      return Response.json({ 
        canCancel: false, 
        reason: 'Cannot cancel - both parties have paid for shipping' 
      });
    }

    // Cannot cancel if already completed or cancelled
    if (['completed', 'cancelled', 'failed'].includes(offer.status)) {
      return Response.json({ 
        canCancel: false, 
        reason: `Trade is already ${offer.status}` 
      });
    }

    // Can cancel if:
    // - Status is pending or accepted
    // - At least one party hasn't paid yet
    if (['pending', 'accepted'].includes(offer.status)) {
      return Response.json({ 
        canCancel: true, 
        reason: 'Trade can be cancelled' 
      });
    }

    // Default: cannot cancel
    return Response.json({ 
      canCancel: false, 
      reason: 'Trade cannot be cancelled at this stage' 
    });

  } catch (error) {
    console.error('Error checking cancellation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});