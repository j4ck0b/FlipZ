-- =========================================================================
-- FLIPZ - COMPLETE DATABASE INITIALIZATION SCHEMA
-- =========================================================================
-- Run this script in the Supabase SQL Editor.
-- It will cleanly setup or update ALL necessary tables, columns, constraints,
-- and Row Level Security (RLS) policies for the FlipZ Marketplace.
-- =========================================================================

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. PROFILES & ACCESS CONTROL
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text,
  full_name text,
  avatar_url text,
  setup_completed boolean default false,
  role text default 'user',
  user_role text,
  is_admin boolean default false,
  subscription_tier text default 'free',
  trade_count_current_month integer default 0,
  shipping_address text,
  stripe_customer_id text,
  created_at timestamptz default now()
);

create table if not exists public.panel_access (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  can_manage_users boolean not null default false,
  can_access_warehouse boolean not null default false,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 2. MARKETPLACE MATERIAlS
-- ==========================================
create table if not exists public.card_listings (
  id uuid primary key default uuid_generate_v4(),
  created_by uuid references public.profiles(id),
  created_by_id uuid references public.profiles(id),
  owner_email text,
  title text not null,
  description text,
  series text,
  condition text,
  game text,
  image_url text,
  status text default 'available', -- options: available, traded, sold
  created_at timestamptz default now()
);

create table if not exists public.liked_listings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.card_listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

create table if not exists public.subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric not null,
  features jsonb,
  created_at timestamptz default now()
);

-- ==========================================
-- 3. TRADE CORE ENGINE
-- ==========================================
create table if not exists public.trade_offers (
  id uuid primary key default uuid_generate_v4(),
  requested_card_id uuid references public.card_listings(id),
  offered_card_ids jsonb, -- array of card IDs
  status text default 'pending', -- pending, accepted, cancelled, completed, failed
  progress_step text, -- payment, preparing_shipment, hub_verification, etc.
  sender_email text,
  owner_email text,
  sender_id uuid references public.profiles(id),
  owner_id uuid references public.profiles(id),
  escrow_mode text,
  both_paid boolean default false,
  owner_paid boolean default false,
  sender_paid boolean default false,
  owner_package_sent boolean default false,
  sender_package_sent boolean default false,
  owner_inspection_accepted boolean default false,
  sender_inspection_accepted boolean default false,
  owner_delivered boolean default false,
  sender_delivered boolean default false,
  created_at timestamptz default now(),
  created_date timestamptz default now()
);

create table if not exists public.trade_payments (
  id uuid primary key default uuid_generate_v4(),
  trade_offer_id uuid references public.trade_offers(id) on delete cascade,
  user_id uuid references public.profiles(id),
  amount numeric not null,
  stripe_session_id text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.shipping_labels (
  id uuid primary key default uuid_generate_v4(),
  trade_offer_id uuid references public.trade_offers(id) on delete cascade,
  sender_email text,
  recipient_email text,
  sender_address text,
  recipient_address text,
  tracking_number text unique,
  label_url text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.trade_reviews (
  id uuid primary key default uuid_generate_v4(),
  trade_offer_id uuid references public.trade_offers(id) on delete cascade,
  reviewer_id uuid references public.profiles(id),
  reviewee_id uuid references public.profiles(id),
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- ==========================================
-- 4. MESSAGING SYSTEM
-- ==========================================
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  partner_id uuid references public.profiles(id) on delete cascade,
  last_message text,
  unread_count integer default 0,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.trade_conversations (
  id uuid primary key default uuid_generate_v4(),
  trade_offer_id uuid references public.trade_offers(id) on delete cascade,
  participant_1_email text,
  participant_2_email text,
  last_message_preview text,
  last_message_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null, -- references either conversations or trade_conversations
  sender_id uuid references public.profiles(id) on delete set null,
  sender_email text,
  sender_name text,
  message_type text default 'text',
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now(),
  created_date timestamptz default now()
);

-- ==========================================
-- 5. INDEXES (Performance)
-- ==========================================
create index if not exists idx_trade_offers_owner_email on public.trade_offers(owner_email);
create index if not exists idx_trade_offers_sender_email on public.trade_offers(sender_email);
create index if not exists idx_trade_offers_owner_id on public.trade_offers(owner_id);
create index if not exists idx_trade_offers_sender_id on public.trade_offers(sender_id);
create index if not exists idx_card_listings_created_by on public.card_listings(created_by);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_trade_conversations_trade_offer_id on public.trade_conversations(trade_offer_id);

-- ==========================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Reset all policies safely before recreating
do $$ 
declare 
  t text; 
  p text; 
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy if exists %I on public.%I', p, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- 6.1 Profiles & Panel Access
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "panel_access_select" on public.panel_access for select using (auth.role() = 'authenticated');

-- 6.2 Card Listings & Likes
create policy "card_listings_select" on public.card_listings for select using (true);
create policy "card_listings_insert" on public.card_listings for insert with check (auth.uid() = created_by or auth.uid() = created_by_id);
create policy "card_listings_update" on public.card_listings for update using (auth.uid() = created_by or auth.uid() = created_by_id);
create policy "card_listings_delete" on public.card_listings for delete using (auth.uid() = created_by or auth.uid() = created_by_id);

create policy "liked_listings_select" on public.liked_listings for select using (auth.uid() = user_id);
create policy "liked_listings_insert" on public.liked_listings for insert with check (auth.uid() = user_id);
create policy "liked_listings_delete" on public.liked_listings for delete using (auth.uid() = user_id);

-- 6.3 Trade Core
create policy "trade_offers_select" on public.trade_offers for select using (
  sender_email = auth.jwt()->>'email' or owner_email = auth.jwt()->>'email' or sender_id = auth.uid() or owner_id = auth.uid()
);
create policy "trade_offers_insert" on public.trade_offers for insert with check (
  sender_email = auth.jwt()->>'email' or sender_id = auth.uid()
);
create policy "trade_offers_update" on public.trade_offers for update using (
  sender_email = auth.jwt()->>'email' or owner_email = auth.jwt()->>'email' or sender_id = auth.uid() or owner_id = auth.uid()
);

create policy "trade_payments_select" on public.trade_payments for select using (auth.uid() = user_id);
create policy "shipping_labels_select" on public.shipping_labels for select using (
  sender_email = auth.jwt()->>'email' or recipient_email = auth.jwt()->>'email'
);

-- 6.4 Messaging
create policy "conversations_select" on public.conversations for select using (auth.uid() = user_id or auth.uid() = partner_id);
create policy "conversations_insert" on public.conversations for insert with check (auth.uid() = user_id or auth.uid() = partner_id);
create policy "conversations_update" on public.conversations for update using (auth.uid() = user_id or auth.uid() = partner_id);

create policy "trade_conversations_select" on public.trade_conversations for select using (
  participant_1_email = auth.jwt()->>'email' or participant_2_email = auth.jwt()->>'email' or participant_1_email = auth.uid()::text or participant_2_email = auth.uid()::text
);
create policy "trade_conversations_insert" on public.trade_conversations for insert with check (
  participant_1_email = auth.jwt()->>'email' or participant_2_email = auth.jwt()->>'email'
);
create policy "trade_conversations_update" on public.trade_conversations for update using (
  participant_1_email = auth.jwt()->>'email' or participant_2_email = auth.jwt()->>'email'
);

create policy "messages_select" on public.messages for select using (true);
create policy "messages_insert" on public.messages for insert with check (
  sender_id = auth.uid() or sender_email = auth.jwt()->>'email'
);

-- ==========================================
-- END OF SCRIPT. All tables and policies deployed.
-- ==========================================
