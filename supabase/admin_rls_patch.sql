-- Administrator RLS Pass-through Policies
-- Run this in SQL Editor to grant Admin access to all tables

do $$ 
begin
  -- PROFILES Admin Access
  drop policy if exists "admin_profiles_select" on public.profiles;
  create policy "admin_profiles_select" on public.profiles for select using (
    exists (select 1 from public.panel_access where email = auth.jwt()->>'email')
    or (select role from public.profiles where id = auth.uid()) in ('admin', 'moderator', 'employee')
  );

  drop policy if exists "admin_profiles_update" on public.profiles;
  create policy "admin_profiles_update" on public.profiles for update using (
    exists (select 1 from public.panel_access where email = auth.jwt()->>'email' and can_manage_users = true)
    or (select role from public.profiles where id = auth.uid()) in ('admin', 'moderator')
  );

  -- TRADES Admin Access
  drop policy if exists "admin_trade_offers_select" on public.trade_offers;
  create policy "admin_trade_offers_select" on public.trade_offers for select using (
    exists (select 1 from public.panel_access where email = auth.jwt()->>'email')
    or (select role from public.profiles where id = auth.uid()) in ('admin', 'moderator', 'employee')
  );

  drop policy if exists "admin_trade_offers_update" on public.trade_offers;
  create policy "admin_trade_offers_update" on public.trade_offers for update using (
    exists (select 1 from public.panel_access where email = auth.jwt()->>'email')
    or (select role from public.profiles where id = auth.uid()) in ('admin', 'moderator', 'employee')
  );

end $$;
