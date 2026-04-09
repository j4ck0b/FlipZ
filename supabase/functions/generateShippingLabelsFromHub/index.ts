import { createClient } from 'npm:@supabase/supabase-js@2';

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

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  try {
    // Autentykacja użytkownika przez JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // Klient serwisowy do uprzywilejowanych operacji na DB
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Weryfikacja uprawnień admina/workhouse przez panel_access
    const { data: panelAccess } = await supabaseAdmin
      .from('panel_access')
      .select('can_access_warehouse, can_manage_users')
      .eq('email', user.email!.trim().toLowerCase())
      .maybeSingle();

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || profile?.is_admin === true;
    const hasWarehouseAccess = isAdmin || panelAccess?.can_access_warehouse === true || panelAccess?.can_manage_users === true;

    if (!hasWarehouseAccess) {
      return Response.json({ error: 'Unauthorized - Warehouse access required' }, { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const { tradeOfferId } = body;

    if (!tradeOfferId) {
      return Response.json({ error: 'Trade offer ID is required' }, { status: 400, headers: corsHeaders });
    }

    // Pobierz szczegóły oferty wymiany
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('trade_offers')
      .select('*')
      .eq('id', tradeOfferId)
      .single();

    if (offerError || !offer) {
      return Response.json({ error: 'Trade offer not found' }, { status: 404, headers: corsHeaders });
    }

    // Pobierz adresy użytkowników z profili
    const { data: senderProfile } = await supabaseAdmin
      .from('profiles')
      .select('shipping_address, full_name, email')
      .or(`email.eq.${offer.sender_email},id.eq.${offer.sender_id}`)
      .maybeSingle();

    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('shipping_address, full_name, email')
      .or(`email.eq.${offer.owner_email},id.eq.${offer.owner_id}`)
      .maybeSingle();

    const senderAddress = senderProfile?.shipping_address || 'Brak adresu w profilu';
    const ownerAddress = ownerProfile?.shipping_address || 'Brak adresu w profilu';

    // TODO: Zintegruj z API InPost ShipX:
    // const inpostApiKey = Deno.env.get('INPOST_API_KEY');
    // const inpostOrgId = Deno.env.get('INPOST_ORG_ID');
    //
    // const createInpostShipment = async (recipientEmail: string, recipientName: string, recipientAddress: string) => {
    //   const response = await fetch(
    //     `https://api-shipx-pl.easypack24.net/v1/organizations/${inpostOrgId}/shipments`,
    //     {
    //       method: 'POST',
    //       headers: {
    //         'Authorization': `Bearer ${inpostApiKey}`,
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify({
    //         receiver: {
    //           email: recipientEmail,
    //           name: recipientName,
    //           phone: '',
    //           address: { street: recipientAddress, city: '', zip_code: '', country_code: 'PL' }
    //         },
    //         parcels: [{ dimensions: { length: 20, width: 15, height: 5 }, weight: { amount: 1, unit: 'kg' } }],
    //         service: 'inpost_locker_standard',
    //         reference: `FLIPZ-${tradeOfferId}`
    //       })
    //     }
    //   );
    //   return await response.json();
    // };

    // Wygeneruj deterministyczne numery śledzenia (mock - zastąp prawdziwym InPost)
    const timestamp = Date.now();
    const baseRef = tradeOfferId.replace(/-/g, '').substring(0, 8).toUpperCase();
    const trackingSender = `FLIPZ-${baseRef}-S${timestamp.toString(36).toUpperCase()}`;
    const trackingOwner = `FLIPZ-${baseRef}-O${timestamp.toString(36).toUpperCase()}`;

    // Sprawdź czy etykiety dla tej wymiany już istnieją
    const { data: existingLabels } = await supabaseAdmin
      .from('shipping_labels')
      .select('id')
      .eq('trade_offer_id', tradeOfferId);

    if (existingLabels && existingLabels.length > 0) {
      // Etykiety już istnieją — zwróć istniejące
      const { data: labels } = await supabaseAdmin
        .from('shipping_labels')
        .select('*')
        .eq('trade_offer_id', tradeOfferId);

      return Response.json({
        success: true,
        labels: labels?.map(l => ({
          recipient: l.recipient_email,
          tracking: l.tracking_number,
          url: l.label_url
        })),
        message: 'Existing labels returned'
      }, { headers: corsHeaders });
    }

    const hubAddress = 'FlipCardZ Hub, ul. Centralna 1, 00-001 Warszawa';
    const mockLabelUrlSender = `https://flipz.app/labels/${trackingSender}.pdf`;
    const mockLabelUrlOwner = `https://flipz.app/labels/${trackingOwner}.pdf`;

    // Etykieta dla sendera (otrzyma paczkę właściciela)
    const { error: senderLabelError } = await supabaseAdmin
      .from('shipping_labels')
      .insert({
        trade_offer_id: offer.id,
        sender_email: 'hub@flipz.app',
        recipient_email: offer.sender_email,
        sender_address: hubAddress,
        recipient_address: senderAddress,
        tracking_number: trackingSender,
        label_url: mockLabelUrlSender,
        status: 'pending'
      });

    if (senderLabelError) {
      console.error('Error creating sender label:', senderLabelError);
      return Response.json({ error: 'Failed to create sender shipping label' }, { status: 500, headers: corsHeaders });
    }

    // Etykieta dla właściciela (otrzyma paczkę sendera)
    const { error: ownerLabelError } = await supabaseAdmin
      .from('shipping_labels')
      .insert({
        trade_offer_id: offer.id,
        sender_email: 'hub@flipz.app',
        recipient_email: offer.owner_email,
        sender_address: hubAddress,
        recipient_address: ownerAddress,
        tracking_number: trackingOwner,
        label_url: mockLabelUrlOwner,
        status: 'pending'
      });

    if (ownerLabelError) {
      console.error('Error creating owner label:', ownerLabelError);
      return Response.json({ error: 'Failed to create owner shipping label' }, { status: 500, headers: corsHeaders });
    }

    // Zaktualizuj trade offer — etykiety wygenerowane, przejdź do hub_verification
    await supabaseAdmin
      .from('trade_offers')
      .update({ progress_step: 'hub_verification' })
      .eq('id', tradeOfferId);

    return Response.json({
      success: true,
      labels: [
        { recipient: offer.sender_email, tracking: trackingSender, url: mockLabelUrlSender },
        { recipient: offer.owner_email, tracking: trackingOwner, url: mockLabelUrlOwner }
      ]
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('generateShippingLabelsFromHub error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate shipping labels'
    }, { status: 500, headers: corsHeaders });
  }
});