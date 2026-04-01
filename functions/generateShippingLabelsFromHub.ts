import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify admin access
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { tradeOfferId } = await req.json();

    if (!tradeOfferId) {
      return Response.json({ error: 'Trade offer ID is required' }, { status: 400 });
    }

    // Get trade offer details
    const tradeOffers = await base44.asServiceRole.entities.TradeOffer.filter({ id: tradeOfferId });
    const offer = tradeOffers[0];

    if (!offer) {
      return Response.json({ error: 'Trade offer not found' }, { status: 404 });
    }

    // Get user addresses from User entity
    const senderUser = await base44.asServiceRole.entities.User.filter({ email: offer.sender_email });
    const ownerUser = await base44.asServiceRole.entities.User.filter({ email: offer.owner_email });

    const senderAddress = senderUser[0]?.address || 'Brak adresu w profilu';
    const ownerAddress = ownerUser[0]?.address || 'Brak adresu w profilu';

    // TODO: Integrate with InPost API here
    // const inpostApiKey = Deno.env.get("INPOST_API_KEY");
    // const inpostOrgId = Deno.env.get("INPOST_ORG_ID");
    // 
    // Call InPost API to create shipments:
    // - Create shipment for sender (recipient: sender, package: owner's cards)
    // - Create shipment for owner (recipient: owner, package: sender's cards)
    // 
    // Example API call structure:
    // const response = await fetch('https://api-shipx-pl.easypack24.net/v1/organizations/{org_id}/shipments', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${inpostApiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     receiver: { email, phone, name, address },
    //     parcels: [{ dimensions, weight }],
    //     service: 'inpost_locker_standard'
    //   })
    // });

    // MOCK: Generate tracking numbers and label URLs (replace with real InPost response)
    const mockTrackingSender = `INPOST-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const mockTrackingOwner = `INPOST-${Date.now() + 1}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const mockLabelUrlSender = `https://example.com/labels/${mockTrackingSender}.pdf`;
    const mockLabelUrlOwner = `https://example.com/labels/${mockTrackingOwner}.pdf`;

    // Create shipping labels in database
    // Label for sender (will receive owner's package)
    await base44.asServiceRole.entities.ShippingLabel.create({
      trade_offer_id: offer.id,
      sender_email: 'hub@flipcardz.store',
      recipient_email: offer.sender_email,
      sender_address: 'FlipCardZ Hub, ul. Centralna 1, 00-001 Warszawa',
      recipient_address: senderAddress,
      tracking_number: mockTrackingSender,
      label_url: mockLabelUrlSender,
      status: 'pending'
    });

    // Label for owner (will receive sender's package)
    await base44.asServiceRole.entities.ShippingLabel.create({
      trade_offer_id: offer.id,
      sender_email: 'hub@flipcardz.store',
      recipient_email: offer.owner_email,
      sender_address: 'FlipCardZ Hub, ul. Centralna 1, 00-001 Warszawa',
      recipient_address: ownerAddress,
      tracking_number: mockTrackingOwner,
      label_url: mockLabelUrlOwner,
      status: 'pending'
    });

    return Response.json({
      success: true,
      labels: [
        { recipient: offer.sender_email, tracking: mockTrackingSender, url: mockLabelUrlSender },
        { recipient: offer.owner_email, tracking: mockTrackingOwner, url: mockLabelUrlOwner }
      ]
    });

  } catch (error) {
    console.error('Error generating shipping labels:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to generate shipping labels' 
    }, { status: 500 });
  }
});