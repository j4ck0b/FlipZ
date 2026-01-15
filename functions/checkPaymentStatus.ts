import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const tradeOfferId = session.metadata.trade_offer_id;
      const userEmail = session.metadata.user_email;
      const escrowMode = session.metadata.escrow_mode;
      const amount = session.amount_total / 100;

      if (tradeOfferId && userEmail) {
        // Get the trade offer
        const tradeOffer = await base44.asServiceRole.entities.TradeOffer.get(tradeOfferId);
        
        if (tradeOffer) {
          // Determine if user is sender or owner
          const isSender = tradeOffer.sender_email === userEmail;
          const updateData = {
            escrow_mode: escrowMode
          };

          if (isSender) {
            updateData.sender_paid = true;
            updateData.sender_payment_id = session.payment_intent;
            updateData.sender_payment_date = new Date().toISOString();
          } else {
            updateData.owner_paid = true;
            updateData.owner_payment_id = session.payment_intent;
            updateData.owner_payment_date = new Date().toISOString();
          }

          // Check if both paid
          const bothPaid = (isSender && tradeOffer.owner_paid) || (!isSender && tradeOffer.sender_paid);
          if (bothPaid) {
            updateData.both_paid = true;
            updateData.progress_step = 'preparing_shipment';
            updateData.addresses_unlocked = true;
          }

          await base44.asServiceRole.entities.TradeOffer.update(tradeOfferId, updateData);

          // Create payment record
          await base44.asServiceRole.entities.TradePayment.create({
            trade_offer_id: tradeOfferId,
            user_email: userEmail,
            protection_tier: escrowMode === 'eco' ? 'basic' : escrowMode === 'light' ? 'secure' : 'collector',
            protection_fee: amount,
            total_amount: amount,
            payment_status: 'completed',
            payment_date: new Date().toISOString()
          });

          return Response.json({ 
            success: true, 
            paid: true,
            bothPaid: bothPaid
          });
        }
      }
    }

    return Response.json({ success: false, paid: false });
  } catch (error) {
    console.error('Check payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});