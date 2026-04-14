-- ══════════════════════════════════════════════════════════
-- Bhoop Singh Sweet House – Supabase Schema V4
-- Run this in Supabase → SQL Editor  (AFTER running v1, v2, v3)
-- ══════════════════════════════════════════════════════════

-- 1. Add Featured column to products table for Home Page
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;


-- 2. Create Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  author_name TEXT NOT NULL,
  author_city TEXT,
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar_emoji TEXT DEFAULT '👨',
  is_visible BOOLEAN DEFAULT true
);

-- Insert some default testimonials so the home page isn't empty initially
INSERT INTO public.testimonials (author_name, author_city, text, rating, avatar_emoji, is_visible)
VALUES 
  ('Rajesh Sharma', 'New Delhi', 'The Motichoor Ladoo here is the best I have ever tasted. My family orders every festive season — it simply feels like home.', 5, '👨', true),
  ('Priya Malhotra', 'Gurugram', 'Ordered a gift box for Diwali and the presentation was stunning. Everyone at the office was impressed. Pure and delicious!', 5, '👩', true),
  ('Suresh Agarwal', 'Gurgaon', 'Bhoop Singh ke mithai ki baat hi alag hai. My grandfather used to bring these. 40 years later, the taste is still the same.', 5, '👴', true);


-- 3. Setup RLS for Testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can read visible testimonials
CREATE POLICY "Public read testimonials" ON public.testimonials
  FOR SELECT USING (is_visible = true);

-- Admins can do everything
CREATE POLICY "Admins manage testimonials" ON public.testimonials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ══════════════════════════════════════════════
-- DONE! Update applied.
-- ══════════════════════════════════════════════
