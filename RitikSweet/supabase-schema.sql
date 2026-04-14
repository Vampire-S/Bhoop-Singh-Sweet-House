-- ══════════════════════════════════════════
-- Bhoop Singh Sweet House – Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ══════════════════════════════════════════

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  full_name  text,
  phone      text,
  created_at timestamptz default now()
);

-- 2. ADDRESSES TABLE
create table if not exists public.addresses (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  label      text,          -- e.g. "Home", "Office"
  street     text,
  city       text,
  state      text,
  pincode    text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- 3. ORDERS TABLE
create table if not exists public.orders (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users on delete cascade not null,
  order_number  text unique,
  items         jsonb,      -- array of {name, qty, price}
  total_amount  numeric,
  status        text default 'placed',  -- placed | processing | out_for_delivery | delivered | cancelled
  placed_at     timestamptz default now()
);

-- ── Row Level Security ──
alter table public.profiles  enable row level security;
alter table public.addresses enable row level security;
alter table public.orders    enable row level security;

-- Profiles policies
create policy "Own profile select" on public.profiles for select using (auth.uid() = id);
create policy "Own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "Own profile update" on public.profiles for update using (auth.uid() = id);

-- Addresses policies
create policy "Own addresses select" on public.addresses for select using (auth.uid() = user_id);
create policy "Own addresses insert" on public.addresses for insert with check (auth.uid() = user_id);
create policy "Own addresses update" on public.addresses for update using (auth.uid() = user_id);
create policy "Own addresses delete" on public.addresses for delete using (auth.uid() = user_id);

-- Orders policies
create policy "Own orders select" on public.orders for select using (auth.uid() = user_id);

-- ── Auto-create profile on signup ──
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
