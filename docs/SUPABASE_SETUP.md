# Supabase setup checklist (FlipZ)

This app assumes a Supabase project with RLS enabled and a few key columns used by the frontend.

## Copy/paste SQL (tables + RLS)

> Paste everything below directly into the Supabase SQL editor.

```sql
-- Extensions (uuid generation)
create extension if not exists "pgcrypto";

-- profiles table
create table if not exists public.profiles (
  id uuid primary key,
  email text,
  username text,
  full_name text,
  profile_picture text,
  bio text,
  location text,
  created_at timestamptz default now()
);

-- card_listings table
create table if not exists public.card_listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  condition text,
  rarity text,
  looking_for text,
  image_urls text[] default '{}',
  status text default 'available',
  collector_name text,
  created_by text,
  created_by_id uuid not null,
  created_at timestamptz default now()
);

-- The frontend writes both created_by (email) and created_by_id (uuid).
-- Keep both columns to avoid mismatches in listings, profile stats, and messaging.

-- RLS policies: profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

-- RLS policies: card_listings
alter table public.card_listings enable row level security;

drop policy if exists "card_listings_select_public" on public.card_listings;
create policy "card_listings_select_public"
on public.card_listings for select
using (true);

drop policy if exists "card_listings_insert_own" on public.card_listings;
create policy "card_listings_insert_own"
on public.card_listings for insert
with check (auth.uid() = created_by_id);

drop policy if exists "card_listings_update_own" on public.card_listings;
create policy "card_listings_update_own"
on public.card_listings for update
using (auth.uid() = created_by_id);

drop policy if exists "card_listings_delete_own" on public.card_listings;
create policy "card_listings_delete_own"
on public.card_listings for delete
using (auth.uid() = created_by_id);
```

## Storage bucket (public read + authenticated upload)

If you are using image uploads, create a bucket named `card-images` and add policies so anyone can read and authenticated users can upload.

```sql
-- Create bucket if it does not exist (public read)
insert into storage.buckets (id, name, public)
values ('card-images', 'card-images', true)
on conflict (id) do update set public = true;

-- Allow public read access to images
drop policy if exists "card_images_public_read" on storage.objects;
create policy "card_images_public_read"
on storage.objects for select
using (bucket_id = 'card-images');

-- Allow authenticated users to upload images
drop policy if exists "card_images_authenticated_insert" on storage.objects;
create policy "card_images_authenticated_insert"
on storage.objects for insert
with check (
  bucket_id = 'card-images'
  and auth.role() = 'authenticated'
);
```

## Cleanup duplicate RLS policies (profiles + card_listings)

If you accidentally created duplicate/overlapping policies, run the SQL below. It will **keep only** the canonical policies listed in this document and remove any other policy on `profiles` or `card_listings`.

```sql
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'card_listings')
      and policyname not in (
        'profiles_select_own',
        'profiles_insert_own',
        'profiles_update_own',
        'card_listings_select_public',
        'card_listings_insert_own',
        'card_listings_update_own',
        'card_listings_delete_own'
      )
  loop
    execute format('drop policy if exists %I on %I.%I;', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;
```


## Profile visibility fix (other user profiles)

If opening `/profile/:userId` for other users fails, your `profiles` RLS is likely too strict.
The frontend loads other user profiles directly from `public.profiles`, so add read policy for authenticated users:

```sql
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_own_or_admin" on public.profiles;

create policy "profiles_select_authenticated"
on public.profiles for select
using (auth.role() = 'authenticated');
```

If you want profile pages publicly visible (without login), replace condition with `using (true)`.

