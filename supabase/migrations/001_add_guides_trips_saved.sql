-- ═══════════════════════════════════════════════════════════
-- Migration: trips + saved_places tables
-- Guides live in `users` table (roles = 'guide', guide_info JSONB)
-- Run in Supabase SQL Editor (Dashboard → SQL → New Query)
-- ═══════════════════════════════════════════════════════════

-- ─── TRIPS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  city TEXT,
  route_json JSONB NOT NULL DEFAULT '{}',
  preview_image_url TEXT,
  total_safety_score INTEGER DEFAULT 0,
  total_duration TEXT,
  estimated_cost TEXT,
  is_public BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── SAVED PLACES (Favorites) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  place_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, place_id)
);

-- ═══ ROW LEVEL SECURITY ═════════════════════════════════════

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

-- Trips: owner CRUD, public trips are readable
CREATE POLICY "trips_select" ON public.trips FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "trips_insert" ON public.trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trips_update" ON public.trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "trips_delete" ON public.trips FOR DELETE USING (auth.uid() = user_id);

-- Saved places: owner only
CREATE POLICY "saved_places_select" ON public.saved_places FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_places_insert" ON public.saved_places FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_places_delete" ON public.saved_places FOR DELETE USING (auth.uid() = user_id);
