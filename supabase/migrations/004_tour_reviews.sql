-- ═══════════════════════════════════════════════════════════
-- Migration 004: Tour Reviews
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.tour_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tour_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_tour ON public.tour_reviews(tour_id);

ALTER TABLE public.tour_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select" ON public.tour_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.tour_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update" ON public.tour_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete" ON public.tour_reviews FOR DELETE USING (auth.uid() = user_id);
