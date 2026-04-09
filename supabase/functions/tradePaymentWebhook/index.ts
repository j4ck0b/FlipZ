import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.5.0';

// Ten webhook jest alternatywą dla stripeWebhook.ts — obsługuje trade payments.
// Używaj go tylko jeśli chcesz osobny endpoint dla trade payments (np. inny URL w Stripe Dashboard).
// W przeciwnym razie wystarczy stripeWebhook.ts który obsługuje oba typy płatności.

Deno.serve(async (req) => {
  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeSecretKey || !webhookSecret) {
      return Response.json({ error: 'Missing Stripe environment variables' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey);

    // Klient serwisowy — webhooki nie mają JWT użytkownika
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Weryfikacja podpisu Stripe (bezpieczeństwo!)
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid webhook signature';
      return Response.json({ error: message }, { status: 400 });
    }

    // Handle payment success
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const tradeOfferId = session.metadata?.trade_offer_id;
      const userEmail = session.metadata?.user_email;
      const escrowMode = session.metadata?.escrow_mode;
      const amount = (session.amount_total ?? 0) / 100;

      if (tradeOfferId && userEmail) {
        const { data: tradeOffer } = await supabaseAdmin
          .from('trade_offers')
          .select('*')
          .eq('id', tradeOfferId)
          .single();

        if (tradeOffer) {
          const isSender = tradeOffer.sender_email === userEmail;
          const updateData: Record<string, unknown> = {
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

          const bothPaid =
            (isSender && tradeOffer.owner_paid) ||
            (!isSender && tradeOffer.sender_paid);

          if (bothPaid) {
            updateData.both_paid = true;
            updateData.status = 'active';
            updateData.addresses_unlocked = true;
            updateData.progress_step = 'preparing_shipment';
          }

          await supabaseAdmin
            .from('trade_offers')
            .update(updateData)
            .eq('id', tradeOfferId);

          // Zapisz płatność
          await supabaseAdmin.from('trade_payments').insert({
            trade_offer_id: tradeOfferId,
            user_email: userEmail,
            protection_tier: escrowMode,
            total_amount: amount,
            payment_status: 'completed',
            stripe_session_id: session.id,
            payment_date: new Date().toISOString()
          });
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('tradePaymentWebhook error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
});