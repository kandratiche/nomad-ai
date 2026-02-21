-- ═══════════════════════════════════════════════════════════
-- Migration 002: Tours & Party Mode
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── TOURS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price_total INTEGER NOT NULL DEFAULT 0,
  max_people INTEGER DEFAULT 4,
  duration_hours NUMERIC(4,1) DEFAULT 3,
  is_premium BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'completed', 'cancelled')),
  start_date TIMESTAMPTZ,
  image_url TEXT,
  city TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── TOUR PARTICIPANTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tour_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'cancelled')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tour_id, user_id)
);

-- ═══ INDEXES ════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_tours_guide ON public.tours(guide_id);
CREATE INDEX IF NOT EXISTS idx_tours_city ON public.tours(city);
CREATE INDEX IF NOT EXISTS idx_tours_status ON public.tours(status);
CREATE INDEX IF NOT EXISTS idx_participants_tour ON public.tour_participants(tour_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.tour_participants(user_id);

-- ═══ ROW LEVEL SECURITY ═════════════════════════════════════

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_participants ENABLE ROW LEVEL SECURITY;

-- Tours: everyone reads active, guide manages own
CREATE POLICY "tours_select" ON public.tours FOR SELECT
  USING (status = 'active' OR guide_id = auth.uid());
CREATE POLICY "tours_insert" ON public.tours FOR INSERT
  WITH CHECK (auth.uid() = guide_id);
CREATE POLICY "tours_update" ON public.tours FOR UPDATE
  USING (auth.uid() = guide_id);
CREATE POLICY "tours_delete" ON public.tours FOR DELETE
  USING (auth.uid() = guide_id);

-- Participants: user sees own, guide sees tour participants
CREATE POLICY "participants_select" ON public.tour_participants FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.tours WHERE id = tour_id AND guide_id = auth.uid())
  );
CREATE POLICY "participants_insert" ON public.tour_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "participants_update" ON public.tour_participants FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.tours WHERE id = tour_id AND guide_id = auth.uid())
  );
CREATE POLICY "participants_delete" ON public.tour_participants FOR DELETE
  USING (auth.uid() = user_id);
