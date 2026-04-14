-- ══════════════════════════════════════════════════════════
-- Bhoop Singh Sweet House – Supabase Schema V3
-- Run this in Supabase → SQL Editor  (AFTER running v1 & v2)
-- ══════════════════════════════════════════════════════════

-- 1. Add Festival Special columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_festival_special BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS festival_tag TEXT; -- e.g. "Diwali 2025", "Holi"

-- 2. Create a site_settings table for admin-controlled config
CREATE TABLE IF NOT EXISTS public.site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Insert default festival banner setting
INSERT INTO public.site_settings (key, value)
  VALUES ('festival_banner', 'Festival Special')
  ON CONFLICT (key) DO NOTHING;

-- 3. RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Public read settings" ON public.site_settings
  FOR SELECT USING (true);

-- Only admins can update settings
CREATE POLICY "Admin update settings" ON public.site_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin insert settings" ON public.site_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ══════════════════════════════════════════════
-- DONE! Festival Special columns are now added.
-- Products with is_festival_special = true will
-- appear on the Festival Special page.
-- ══════════════════════════════════════════════
