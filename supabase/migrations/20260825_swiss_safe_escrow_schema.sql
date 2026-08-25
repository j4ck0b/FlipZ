-- =========================================================================
-- FLIPZ - SWISS SAFE ESCROW & SUBSCRIPTION REFACTOR MIGRATION
-- =========================================================================

-- 1. Aktualizacja typów i statusów transakcji
-- Dozwolone statusy wymiany:
-- 'PROPOSED', 'ACCEPTED', 'PAYMENTS_HELD', 'IN_TRANSIT_TO_HUB', 'IN_VERIFICATION', 
-- 'VERIFIED_SUCCESS', 'DISPATCHED', 'COMPLETED', 'DISPUTED'

-- Dodanie kolumn rozszerzających trade_offers / trades o parametry Swiss Safe
alter table if exists public.trade_offers
  add column if not exists status_v2 text default 'PROPOSED',
  add column if not exists escrow_tier text default 'standard_escrow', -- 'standard_escrow', 'swiss_safe', 'vault_black'
  add column if not exists declared_value_pln numeric(10,2) default 0.00,
  add column if not exists collateral_amount_pln numeric(10,2) default 0.00,
  add column if not exists sender_inpost_tracking text,
  add column if not exists owner_inpost_tracking text,
  add column if not exists hub_to_sender_tracking text,
  add column if not exists hub_to_owner_tracking text,
  add column if not exists is_disputed boolean default false,
  add column if not exists dispute_reason text,
  add column if not exists dispute_resolution text;

-- 2. Tabela audytowa: escrow_audit_trail (Append-Only Log)
-- Przechowuje niezmienne wyniki badań laboratoryjnych NDT i łańcuch dowodowy SHA-256
create table if not exists public.escrow_audit_trail (
  id uuid primary key default gen_random_uuid(),
  trade_offer_id uuid references public.trade_offers(id) on delete cascade,
  package_type text not null check (package_type in ('sender', 'owner')),
  verifier_id uuid references public.profiles(id),
  verifier_name text,
  weight_grams numeric(8, 3) not null, -- waga analityczna +/- 0.001 g
  thickness_mm numeric(6, 3),          -- pomiar mikrometrem +/- 0.001 mm
  uv_fluorescence_pass boolean not null default true, -- test UV 365 nm (inking/retusz)
  surface_edge_integrity_score integer check (surface_edge_integrity_score between 1 and 100),
  nfc_tamper_seal_id text,             -- ID hermetycznej plomby destrukcyjnej / NFC
  media_sha256_hashes jsonb default '[]'::jsonb, -- tablica { filename, sha256, url, mime_type }
  verification_verdict text not null check (verification_verdict in ('PASSED', 'REJECTED')),
  notes text,
  certificate_sha256 text,             -- hash cyfrowego certyfikatu Swiss Safe
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS dla escrow_audit_trail
alter table public.escrow_audit_trail enable row level security;

-- Użytkownicy biorący udział w transakcji mogą odczytywać rekordy audytowe
create policy "escrow_audit_trail_select" on public.escrow_audit_trail
  for select using (
    exists (
      select 1 from public.trade_offers t
      where t.id = escrow_audit_trail.trade_offer_id
        and (
          t.sender_email = auth.jwt()->>'email'
          or t.owner_email = auth.jwt()->>'email'
          or t.sender_id = auth.uid()
          or t.owner_id = auth.uid()
        )
    )
    or exists (
      select 1 from public.panel_access pa
      where pa.user_id = auth.uid() and pa.role in ('admin', 'employee')
    )
  );

-- Tylko pracownicy Hubu / administratorzy mogą dodawać rekordy
create policy "escrow_audit_trail_insert" on public.escrow_audit_trail
  for insert with check (
    exists (
      select 1 from public.panel_access pa
      where pa.user_id = auth.uid() and pa.role in ('admin', 'employee')
    )
  );

-- 3. Egzekwowanie limitów ogłoszeń w zależności od subskrypcji
-- Collector Free: max 5 kart
-- Pro Trader: max 30 kart
-- Vault Master: nielimitowane (∞)

create or replace function public.check_card_listing_limits()
returns trigger as $$
declare
  user_tier text := 'free';
  current_count integer := 0;
  max_allowed integer := 5;
begin
  -- Pobierz aktualny tier użytkownika z profilu
  select coalesce(subscription_tier, 'free') into user_tier
  from public.profiles
  where id = NEW.created_by or email = auth.jwt()->>'email'
  limit 1;

  -- Ustal dopuszczalny limit
  if user_tier = 'vault_master' or user_tier = 'premium' then
    return NEW; -- brak limitu
  elsif user_tier = 'pro' or user_tier = 'basic' then
    max_allowed := 30;
  else
    max_allowed := 5;
  end if;

  -- Policz aktualną liczbę aktywnych ogłoszeń użytkownika
  select count(*) into current_count
  from public.card_listings
  where (created_by = NEW.created_by or created_by_id = NEW.created_by or user_email = auth.jwt()->>'email')
    and (status is null or status = 'active');

  if current_count >= max_allowed then
    raise exception 'Przekroczono limit ogłoszeń dla Twojego planu subskrypcji (Aktualny limit: % kart w planie %). Przejdź na wyższy plan, aby dodać więcej kart.', max_allowed, user_tier;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

-- Podpięcie triggera przed dodaniem karty
drop trigger if exists tr_check_card_listing_limits on public.card_listings;
create trigger tr_check_card_listing_limits
  before insert on public.card_listings
  for each row execute function public.check_card_listing_limits();

-- 4. Aktualizacja tabeli planów subskrypcyjnych
insert into public.subscription_plans (id, tier, name, price_monthly, trade_limit, popular, features)
values 
  ('plan_free', 'free', 'Collector Free', 0, 5, false, '["Limit: 5 aktywnych ogłoszeń", "Podstawowy silnik matchingu 2-cykli", "Standardowa kolejka", "Wsparcie społeczności"]'::jsonb),
  ('plan_pro', 'pro', 'Pro Trader', 29, 30, true, '["Limit: 30 aktywnych ogłoszeń", "-10% stałej zniżki na escrow", "Natychmiastowe alerty matchingu", "Odznaka PRO na profilu", "Priorytetowe wsparcie"]'::jsonb),
  ('plan_vault_master', 'vault_master', 'Vault Master', 69, 0, false, '["Bez limitu (∞) ogłoszeń", "-20% stałej zniżki na escrow", "Dedykowany priorytet w Hubie", "Historia wycen rynkowych", "Dedykowany opiekun konta"]'::jsonb)
on conflict (id) do update set
  tier = excluded.tier,
  name = excluded.name,
  price_monthly = excluded.price_monthly,
  trade_limit = excluded.trade_limit,
  popular = excluded.popular,
  features = excluded.features;
