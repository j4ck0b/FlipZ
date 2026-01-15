import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      console.error('No user authenticated');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received request body:', body);
    const { priceId, tier, amount, planName } = body;

    if (!tier) {
      console.error('Missing tier in request');
      return Response.json({ error: 'Missing tier' }, { status: 400 });
    }

    if (!amount) {
      console.error('Missing amount in request');
      return Response.json({ error: 'Missing amount' }, { status: 400 });
    }

    console.log('Creating checkout session for user:', user.email, 'tier:', tier, 'amount:', amount);

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

    // Get origin URL
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://app.base44.app';
    console.log('Using origin:', origin);

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
      success_url: `${origin}/Subscription?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/Subscription?payment=cancelled`,
      metadata: {
        base44_user_id: user.id,
        subscription_tier: tier
      }
    });

    console.log('Stripe session created:', session.id, 'URL:', session.url);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});