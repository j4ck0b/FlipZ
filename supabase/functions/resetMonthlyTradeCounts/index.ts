import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admin can run this
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all users
    const users = await base44.asServiceRole.entities.User.list('-created_date', 10000);
    
    let resetCount = 0;
    for (const u of users) {
      if (u.trade_count_current_month > 0) {
        await base44.asServiceRole.entities.User.update(u.id, {
          trade_count_current_month: 0
        });
        resetCount++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `Reset trade counts for ${resetCount} users`,
      totalUsers: users.length
    });
  } catch (error) {
    console.error('Reset error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});