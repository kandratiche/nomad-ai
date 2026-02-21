-- ═══════════════════════════════════════════════════════════
-- Migration 005: Tour Group Chat Messages
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.tour_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_tour ON public.tour_messages(tour_id, created_at);

ALTER TABLE public.tour_messages ENABLE ROW LEVEL SECURITY;

-- Participants and guide can read messages
CREATE POLICY "messages_select" ON public.tour_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tour_participants WHERE tour_id = tour_messages.tour_id AND user_id = auth.uid() AND status != 'cancelled')
  OR EXISTS (SELECT 1 FROM public.tours WHERE id = tour_messages.tour_id AND guide_id = auth.uid())
);

-- Participants and guide can send messages
CREATE POLICY "messages_insert" ON public.tour_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND (
    EXISTS (SELECT 1 FROM public.tour_participants WHERE tour_id = tour_messages.tour_id AND user_id = auth.uid() AND status != 'cancelled')
    OR EXISTS (SELECT 1 FROM public.tours WHERE id = tour_messages.tour_id AND guide_id = auth.uid())
  )
);

-- Also enable Supabase Realtime on this table:
-- In Supabase Dashboard -> Database -> Replication -> Enable for tour_messages
