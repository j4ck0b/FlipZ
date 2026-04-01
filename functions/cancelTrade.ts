import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tradeOfferId, reason } = await req.json();

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
        error: 'You are not a participant in this trade' 
      }, { status: 403 });
    }

    // Validation: Cannot cancel if both parties have paid
    if (offer.both_paid || (offer.sender_paid && offer.owner_paid)) {
      return Response.json({ 
        error: 'Cannot cancel - both parties have paid for shipping. Please contact support.' 
      }, { status: 400 });
    }

    // Validation: Cannot cancel if already completed or cancelled
    if (['completed', 'cancelled', 'failed'].includes(offer.status)) {
      return Response.json({ 
        error: `Trade is already ${offer.status}` 
      }, { status: 400 });
    }

    // Validation: Can only cancel pending or accepted trades
    if (!['pending', 'accepted'].includes(offer.status)) {
      return Response.json({ 
        error: 'Trade cannot be cancelled at this stage' 
      }, { status: 400 });
    }

    // Update trade offer status
    await base44.entities.TradeOffer.update(offer.id, {
      status: 'cancelled',
      cancelled_by: user.email,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason || 'Cancelled by user'
    });

    // Restore card availability
    await base44.entities.CardListing.update(offer.requested_card_id, { 
      status: 'available' 
    });

    for (const cardId of offer.offered_card_ids || []) {
      await base44.entities.CardListing.update(cardId, { 
        status: 'available' 
      });
    }

    return Response.json({ 
      success: true,
      message: 'Trade cancelled successfully' 
    });

  } catch (error) {
    console.error('Error cancelling trade:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});