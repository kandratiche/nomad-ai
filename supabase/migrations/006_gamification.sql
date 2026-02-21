-- ═══════════════════════════════════════════════════════════
-- Migration 006: Gamification - Points & Achievements
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Points field on tour_participants
ALTER TABLE public.tour_participants
  ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
 
-- User-level stats
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tours_joined INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reviews_written INTEGER DEFAULT 0;
