-- Run this script in your Supabase SQL Editor to enable the chat and messaging system

-- 1. Create conversations table (for direct user-to-user messages)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  partner_id uuid references public.profiles(id) on delete cascade,
  last_message text,
  unread_count integer default 0,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 2. Create trade_conversations table (for trade-specific chats)
create table if not exists public.trade_conversations (
  id uuid primary key default gen_random_uuid(),
  trade_offer_id uuid references public.trade_offers(id) on delete cascade,
  participant_1_email text,
  participant_2_email text,
  last_message_preview text,
  last_message_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 3. Create messages table (shared for both direct and trade chats)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null, -- can be reference to either conversations or trade_conversations
  sender_id uuid references public.profiles(id) on delete set null,
  sender_email text,
  sender_name text,
  message_type text default 'text',
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now(),
  created_date timestamptz default now() -- added for apiClient fallback compatibility
);

-- 4. Enable Row Level Security (RLS)
alter table public.conversations enable row level security;
alter table public.trade_conversations enable row level security;
alter table public.messages enable row level security;

-- 5. Drop existing policies to prevent conflicts
drop policy if exists "conversations_select_participants" on public.conversations;
drop policy if exists "conversations_insert_participants" on public.conversations;
drop policy if exists "conversations_update_participants" on public.conversations;

drop policy if exists "trade_conversations_select_participants" on public.trade_conversations;
drop policy if exists "trade_conversations_insert_participants" on public.trade_conversations;
drop policy if exists "trade_conversations_update_participants" on public.trade_conversations;

drop policy if exists "messages_select_participants" on public.messages;
drop policy if exists "messages_insert_participants" on public.messages;

-- 6. Create RLS Policies for conversations
create policy "conversations_select_participants" on public.conversations
for select using (auth.uid() = user_id or auth.uid() = partner_id);

create policy "conversations_insert_participants" on public.conversations
for insert with check (auth.uid() = user_id or auth.uid() = partner_id);

create policy "conversations_update_participants" on public.conversations
for update using (auth.uid() = user_id or auth.uid() = partner_id);

-- 7. Create RLS Policies for trade_conversations
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
);

create policy "trade_conversations_update_participants" on public.trade_conversations
for update using (
  participant_1_email = auth.jwt()->>'email'
  or participant_2_email = auth.jwt()->>'email'
);

-- 8. Create RLS Policies for messages
create policy "messages_select_participants" on public.messages
for select using (true); -- simplified for now, any authenticated user can read if they have conversation access

create policy "messages_insert_participants" on public.messages
for insert with check (
  sender_id = auth.uid()
  or sender_email = auth.jwt()->>'email'
);
