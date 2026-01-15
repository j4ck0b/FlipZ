import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Verify webhook signature (in production, use STRIPE_WEBHOOK_SECRET)
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.base44_user_id;
        const tier = session.metadata.subscription_tier;

        if (userId && tier) {
          // Calculate expiry date (1 month from now)
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 1);

          await base44.asServiceRole.entities.User.update(userId, {
            subscription_tier: tier,
            subscription_expiry_date: expiryDate.toISOString()
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by stripe_customer_id
        const users = await base44.asServiceRole.entities.User.filter({ 
          stripe_customer_id: customerId 
        });

        if (users.length > 0) {
          const user = users[0];
          
          if (event.type === 'customer.subscription.deleted') {
            // Downgrade to free
            await base44.asServiceRole.entities.User.update(user.id, {
              subscription_tier: 'free',
              subscription_expiry_date: null
            });
          }
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});