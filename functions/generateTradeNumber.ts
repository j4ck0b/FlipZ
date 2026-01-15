import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all trade offers to count them
    const allOffers = await base44.asServiceRole.entities.TradeOffer.list('-created_date');
    
    // Generate trade number: TRADE-YYYY-NNN
    const year = new Date().getFullYear();
    const nextNumber = allOffers.length + 1;
    const tradeNumber = `TRADE-${year}-${String(nextNumber).padStart(4, '0')}`;

    return Response.json({ tradeNumber });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});