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

    const { priceId, tier, amount, planName } = await req.json();

    if (!tier) {
      return Response.json({ error: 'Missing tier' }, { status: 400 });
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
      
      // Save customer ID
      await base44.asServiceRole.entities.User.update(user.id, {
        stripe_customer_id: customerId
      });
    }

    // Create checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'blik'],
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: planName || `Subscription - ${tier}`,
              description: `Monthly subscription plan`,
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: Math.round(amount * 100), // Convert to grosz
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/Subscription?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/Subscription?payment=cancelled`,
      metadata: {
        base44_user_id: user.id,
        subscription_tier: tier
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});