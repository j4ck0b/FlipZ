import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify admin access
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { email, role } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Invite user with specified role (default to 'admin')
    await base44.users.inviteUser(email, role || 'admin');

    return Response.json({
      success: true,
      message: `User ${email} invited as ${role || 'admin'}`
    });

  } catch (error) {
    console.error('Error inviting user:', error);
    return Response.json({ 
      error: error.message || 'Failed to invite user' 
    }, { status: 500 });
  }
});