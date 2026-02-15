import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const buildCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
};

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  console.log('=== createCheckoutSession START ===');
  try {
    console.log('1. Creating base44 client...');
    const base44 = createClientFromRequest(req);
    
    console.log('2. Getting user...');
    const user = await base44.auth.me();
    console.log('User:', user?.email);

    if (!user) {
      console.error('No user authenticated');
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    console.log('3. Parsing request body...');
    const body = await req.json();
    console.log('Body:', JSON.stringify(body));
    const { tier, amount, planName } = body;

    if (!tier) {
      console.error('Missing tier');
      return Response.json({ error: 'Missing tier' }, { status: 400, headers: corsHeaders });
    }

    if (!amount) {
      console.error('Missing amount');
      return Response.json({ error: 'Missing amount' }, { status: 400, headers: corsHeaders });
    }

    console.log('4. Getting/creating Stripe customer...');
    let customerId = user.stripe_customer_id;
    console.log('Existing customer ID:', customerId);
    
    if (!customerId) {
      console.log('Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          base44_user_id: user.id,
          base44_email: user.email
        }
      });
      customerId = customer.id;
      console.log('New customer ID:', customerId);
      
      console.log('Saving customer ID to user...');
      await base44.asServiceRole.entities.User.update(user.id, {
        stripe_customer_id: customerId
      });
    }

    console.log('5. Creating Stripe checkout session...');
    const origin = 'https://app.base44.app';
    const sessionData = {
      customer: customerId,
      payment_method_types: ['card', 'blik'],
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: planName || `Subscription - ${tier}`,
              description: 'Monthly subscription plan',
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: Math.round(amount * 100),
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
    };
    
    console.log('Session data:', JSON.stringify(sessionData, null, 2));
    const session = await stripe.checkout.sessions.create(sessionData);
    
    console.log('6. Session created successfully!');
    console.log('Session ID:', session.id);
    console.log('Session URL:', session.url);
    console.log('=== createCheckoutSession END ===');
    
    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    console.error('=== ERROR in createCheckoutSession ===');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    console.error('Full error:', JSON.stringify(error, null, 2));
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});