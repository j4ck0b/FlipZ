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
<
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);


create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);


create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

-- RLS policies: card_listings
alter table public.card_listings enable row level security;

"card_listings_select_public"
on public.card_listings for select
using (true);


create policy "card_listings_insert_own"
on public.card_listings for insert
with check (auth.uid() = created_by_id);


create policy "card_listings_update_own"
on public.card_listings for update
using (auth.uid() = created_by_id);


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

create policy "card_images_public_read"
on storage.objects for select
using (bucket_id = 'card-images');

-- Allow authenticated users to upload images
in
create policy "card_images_authenticated_insert"
on storage.objects for insert
with check (
  bucket_id = 'card-images'
  and auth.role() = 'authenticated'
);
```
<