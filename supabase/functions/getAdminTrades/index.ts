import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const buildCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
};

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403, headers: corsHeaders });
    }

    // Use service role to get all trades
    const trades = await base44.asServiceRole.entities.TradeOffer.list('-created_date', 1000);

    return Response.json({ 
      success: true,
      trades 
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error fetching admin trades:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});