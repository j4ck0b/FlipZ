# Supabase setup checklist (FlipZ)

This app assumes a Supabase project with RLS enabled and a few key columns used by the frontend.

## Required tables/columns

### `profiles`
- `id` (uuid, primary key, equals `auth.uid()`)
- `email` (text)
- `full_name` (text)
- `username` (text)
- `profile_picture` (text, optional)
- `bio` (text, optional)
- `location` (text, optional)
- `created_at` (timestamp, default now)

### `card_listings`
- `id` (uuid, primary key)
- `title` (text)
- `description` (text)
- `category` (text)
- `condition` (text)
- `rarity` (text)
- `looking_for` (text)
- `image_urls` (text[])
- `status` (text)
- `collector_name` (text)
- `created_by` (text, **email**)
- `created_by_id` (uuid, **user id**)
- `created_at` (timestamp, default now)

> The frontend currently writes both `created_by` (email) and `created_by_id` (uuid). Keep both columns to avoid mismatches in listings, profile stats, and messaging.

## RLS policies (SQL)

Enable row-level security on both tables and add the following policies:

```sql
-- profiles
alter table profiles enable row level security;

create policy "profiles_select_own"
on profiles for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on profiles for update
using (auth.uid() = id);

-- card_listings
alter table card_listings enable row level security;

create policy "card_listings_select_public"
on card_listings for select
using (true);

create policy "card_listings_insert_own"
on card_listings for insert
with check (auth.uid() = created_by_id);

create policy "card_listings_update_own"
on card_listings for update
using (auth.uid() = created_by_id);

create policy "card_listings_delete_own"
on card_listings for delete
using (auth.uid() = created_by_id);
```

## Storage bucket

If you are using image uploads, create a bucket named `card-images` and add a policy that allows authenticated users to upload and read their files.

