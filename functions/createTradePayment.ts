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

    const { tradeOfferId, escrowMode, amount } = await req.json();

    if (!tradeOfferId || !escrowMode || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create Stripe customer
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'blik'],
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: `Escrow Protection - ${escrowMode} Mode`,
              description: 'Secure trade verification and protection',
            },
            unit_amount: Math.round(amount * 100), // Convert to grosz
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/my-listings?payment=success&trade=${tradeOfferId}`,
      cancel_url: `${req.headers.get('origin')}/my-listings?payment=cancelled`,
      metadata: {
        base44_user_id: user.id,
        trade_offer_id: tradeOfferId,
        escrow_mode: escrowMode,
        user_email: user.email
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});