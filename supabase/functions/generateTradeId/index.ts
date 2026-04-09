import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generates a unique 12-digit trade ID
 * Format: YYMMDDHHMMSS (Year-Month-Day-Hour-Minute-Second)
 * Example: 260115143027 = 2026-01-15 14:30:27
 */
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

    // Generate base ID from current timestamp
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // Last 2 digits of year
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    let tradeId = `${year}${month}${day}${hour}${minute}${second}`;

    // Ensure uniqueness by checking database
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await base44.entities.TradeOffer.filter({ trade_id: tradeId });
      
      if (existing.length === 0) {
        // ID is unique
        return Response.json({ 
          tradeId,
          formatted: `${year}${month}${day}-${hour}${minute}${second}` // Optional formatted version
        }, { headers: corsHeaders });
      }

      // Collision detected - add random digit at the end and adjust
      const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
      const randomSuffix = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      
      // Keep it 12 digits: use last 2 digits of milliseconds + random
      tradeId = `${year}${month}${day}${hour}${minute}${milliseconds.slice(-2)}`;
      attempts++;
    }

    // If still no unique ID after max attempts, throw error
    return Response.json({ 
      error: 'Failed to generate unique trade ID after multiple attempts' 
    }, { status: 500, headers: corsHeaders });

  } catch (error) {
    console.error('Error generating trade ID:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});