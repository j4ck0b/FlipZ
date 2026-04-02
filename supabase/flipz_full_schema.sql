-- =========================================================================
-- FLIPZ - FINAL DATABASE CONFIGURATION & RLS SETUP
-- =========================================================================

-- We don't drop existing tables to prevent data loss.
-- Instead, we just ensure proper extensions and policies.
create extension if not exists "uuid-ossp";

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Reset all policies safely before recreating them
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

-- 1. Profiles & Panel Access
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);

create policy "panel_access_select" on public.panel_access for select using (auth.role() = 'authenticated');

-- 2. Card Listings & Likes
create policy "card_listings_select" on public.card_listings for select using (true);
create policy "card_listings_insert" on public.card_listings for insert with check (auth.uid() = created_by or auth.uid() = created_by_id);
create policy "card_listings_update" on public.card_listings for update using (auth.uid() = created_by or auth.uid() = created_by_id);
create policy "card_listings_delete" on public.card_listings for delete using (auth.uid() = created_by or auth.uid() = created_by_id);

create policy "liked_listings_select" on public.liked_listings for select using (user_email = auth.jwt()->>'email');
create policy "liked_listings_insert" on public.liked_listings for insert with check (user_email = auth.jwt()->>'email');
create policy "liked_listings_delete" on public.liked_listings for delete using (user_email = auth.jwt()->>'email');

create policy "subscription_plans_select" on public.subscription_plans for select using (true);

-- 3. Trade Core
create policy "trade_offers_select" on public.trade_offers for select using (
  sender_email = auth.jwt()->>'email' or owner_email = auth.jwt()->>'email' or sender_id = auth.uid() or owner_id = auth.uid()
);
create policy "trade_offers_insert" on public.trade_offers for insert with check (
  sender_email = auth.jwt()->>'email' or sender_id = auth.uid()
);
create policy "trade_offers_update" on public.trade_offers for update using (
  sender_email = auth.jwt()->>'email' or owner_email = auth.jwt()->>'email' or sender_id = auth.uid() or owner_id = auth.uid()
);

create policy "trade_payments_select" on public.trade_payments for select using (user_email = auth.jwt()->>'email');
create policy "trade_payments_insert" on public.trade_payments for insert with check (user_email = auth.jwt()->>'email');

create policy "shipping_labels_select" on public.shipping_labels for select using (
  sender_email = auth.jwt()->>'email' or recipient_email = auth.jwt()->>'email'
);
create policy "shipping_labels_insert" on public.shipping_labels for insert with check (
  sender_email = auth.jwt()->>'email' or recipient_email = auth.jwt()->>'email'
);

-- 4. Messaging
create policy "conversations_select" on public.conversations for select using (
  participant1_email = auth.jwt()->>'email' or participant2_email = auth.jwt()->>'email'
);
create policy "conversations_insert" on public.conversations for insert with check (
  participant1_email = auth.jwt()->>'email' or participant2_email = auth.jwt()->>'email'
);
create policy "conversations_update" on public.conversations for update using (
  participant1_email = auth.jwt()->>'email' or participant2_email = auth.jwt()->>'email'
);

create policy "trade_conversations_select" on public.trade_conversations for select using (
  participant_1_email = auth.jwt()->>'email' or participant_2_email = auth.jwt()->>'email'
);
create policy "trade_conversations_insert" on public.trade_conversations for insert with check (
  participant_1_email = auth.jwt()->>'email' or participant_2_email = auth.jwt()->>'email'
);
create policy "trade_conversations_update" on public.trade_conversations for update using (
  participant_1_email = auth.jwt()->>'email' or participant_2_email = auth.jwt()->>'email'
);

create policy "messages_select" on public.messages for select using (true);
create policy "messages_insert" on public.messages for insert with check (
  sender_email = auth.jwt()->>'email'
);

-- ==========================================
-- INDEXES
-- ==========================================
create index if not exists idx_trade_offers_owner_email on public.trade_offers(owner_email);
create index if not exists idx_trade_offers_sender_email on public.trade_offers(sender_email);
create index if not exists idx_card_listings_created_by on public.card_listings(created_by);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_trade_conversations_trade_offer_id on public.trade_conversations(trade_offer_id);
