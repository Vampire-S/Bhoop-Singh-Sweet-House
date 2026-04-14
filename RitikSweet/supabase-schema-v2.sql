-- ══════════════════════════════════════════════════════════
-- Bhoop Singh Sweet House – Supabase Schema V2 (additions)
-- Run this in Supabase → SQL Editor  (AFTER running v1)
-- ══════════════════════════════════════════════════════════

-- 1. Add ROLE to profiles
alter table public.profiles
  add column if not exists role text default 'customer'
  check (role in ('customer','admin'));

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  category     text,
  eyebrow      text,        -- badge label e.g. "Seasonal Signature"
  description  text,
  ingredients  text,
  craft        text,        -- "Our Craft" story
  image_url    text,
  prices       jsonb,       -- [{"label":"250g","price":210}, ...]
  is_available boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 3. RLS for products
alter table public.products enable row level security;

-- Customers & guests can read available products
create policy "Public read available products" on public.products
  for select using (is_available = true);

-- Admins can read ALL products (including hidden)
create policy "Admin read all products" on public.products
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can insert, update, delete
create policy "Admin insert products" on public.products
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admin update products" on public.products
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admin delete products" on public.products
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 4. Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ══════════════════════════════════════════════
-- AFTER running this SQL, go to:
-- Supabase → Storage → New Bucket
-- Name: product-images   ✓ Public bucket
-- ══════════════════════════════════════════════
