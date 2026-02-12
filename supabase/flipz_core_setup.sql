-- FlipZ core alignment SQL (run in Supabase SQL editor)
-- 1) Core columns expected by frontend
alter table if exists public.profiles
  add column if not exists role text default 'user',
  add column if not exists user_role text,
  add column if not exists is_admin boolean default false,
  add column if not exists subscription_tier text default 'free',
  add column if not exists trade_count_current_month integer default 0,
  add column if not exists shipping_address text;

alter table if exists public.card_listings
  add column if not exists owner_email text,
  add column if not exists created_by uuid,
  add column if not exists created_by_id uuid;

alter table if exists public.trade_offers
  add column if not exists owner_id uuid,
  add column if not exists sender_id uuid,
  add column if not exists escrow_mode text,
  add column if not exists progress_step text,
  add column if not exists both_paid boolean default false,
  add column if not exists owner_paid boolean default false,
  add column if not exists sender_paid boolean default false,
  add column if not exists owner_package_sent boolean default false,
  add column if not exists sender_package_sent boolean default false,
  add column if not exists owner_inspection_accepted boolean default false,
  add column if not exists sender_inspection_accepted boolean default false,
  add column if not exists owner_delivered boolean default false,
  add column if not exists sender_delivered boolean default false;

create table if not exists public.panel_access (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  can_manage_users boolean not null default false,
  can_access_warehouse boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2) Backfill for existing data
update public.card_listings cl
set owner_email = p.email
from public.profiles p
where cl.owner_email is null and (cl.created_by = p.id or cl.created_by_id = p.id);

update public.trade_offers t
set owner_id = cl.created_by_id,
    owner_email = coalesce(t.owner_email, cl.owner_email)
from public.card_listings cl
where t.requested_card_id = cl.id and t.owner_id is null;

-- 3) Indexes
create index if not exists idx_trade_offers_owner_email on public.trade_offers(owner_email);
create index if not exists idx_trade_offers_sender_email on public.trade_offers(sender_email);
create index if not exists idx_trade_offers_owner_id on public.trade_offers(owner_id);
create index if not exists idx_trade_offers_sender_id on public.trade_offers(sender_id);
create index if not exists idx_panel_access_email on public.panel_access(email);

-- 4) RLS policies (safe baseline)
alter table public.profiles enable row level security;
alter table public.panel_access enable row level security;

-- profiles: user can read/update own row
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

-- panel_access: readable by authenticated users, writable only by service role/admin SQL scripts
drop policy if exists "panel_access_select_authenticated" on public.panel_access;
create policy "panel_access_select_authenticated" on public.panel_access
for select using (auth.role() = 'authenticated');

-- 5) Edge function helper SQL (RPC fallbacks)
create or replace function public.generate_trade_id()
returns text
language plpgsql
as $$
declare
  v text;
begin
  v := lpad((floor(random()*999999999999)::bigint)::text, 12, '0');
  return v;
end;
$$;


-- 6) Policy reset to avoid recursive RLS checks
alter table if exists public.trade_offers enable row level security;
alter table if exists public.trade_conversations enable row level security;

-- Drop potentially recursive/legacy policies (safe if they don't exist)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_recursive_select" on public.profiles;
drop policy if exists "profiles_recursive_update" on public.profiles;

drop policy if exists "trade_offers_select_participants" on public.trade_offers;
drop policy if exists "trade_offers_insert_sender" on public.trade_offers;
drop policy if exists "trade_offers_update_participants" on public.trade_offers;

drop policy if exists "trade_conversations_select_participants" on public.trade_conversations;
drop policy if exists "trade_conversations_insert_participants" on public.trade_conversations;
drop policy if exists "trade_conversations_update_participants" on public.trade_conversations;

-- Recreate minimal non-recursive policies
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "trade_offers_select_participants" on public.trade_offers
for select using (
  sender_email = auth.jwt()->>'email'
  or owner_email = auth.jwt()->>'email'
  or sender_id = auth.uid()
  or owner_id = auth.uid()
);

create policy "trade_offers_insert_sender" on public.trade_offers
for insert with check (
  sender_email = auth.jwt()->>'email'
  or sender_id = auth.uid()
);

create policy "trade_offers_update_participants" on public.trade_offers
for update using (
  sender_email = auth.jwt()->>'email'
  or owner_email = auth.jwt()->>'email'
  or sender_id = auth.uid()
  or owner_id = auth.uid()
);

create policy "trade_conversations_select_participants" on public.trade_conversations
for select using (
  participant_1_email = auth.jwt()->>'email'
  or participant_2_email = auth.jwt()->>'email'
  or participant_1_email = auth.uid()::text
  or participant_2_email = auth.uid()::text
);

create policy "trade_conversations_insert_participants" on public.trade_conversations
for insert with check (
  participant_1_email = auth.jwt()->>'email'
  or participant_2_email = auth.jwt()->>'email'
  or participant_1_email = auth.uid()::text
  or participant_2_email = auth.uid()::text
);

create policy "trade_conversations_update_participants" on public.trade_conversations
for update using (
  participant_1_email = auth.jwt()->>'email'
  or participant_2_email = auth.jwt()->>'email'
  or participant_1_email = auth.uid()::text
  or participant_2_email = auth.uid()::text
);
