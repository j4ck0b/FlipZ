import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    await base44.users.inviteUser('krzyskwiatkowski123@gmail.com', 'admin');

    return Response.json({
      success: true,
      message: 'Krzysztof Kwiatkowski invited as admin'
    });

  } catch (error) {
    console.error('Error inviting user:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});