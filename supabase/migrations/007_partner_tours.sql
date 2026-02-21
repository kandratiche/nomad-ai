-- ═══════════════════════════════════════════════════════════
-- Migration 007: Partner Tours — extend tours with partner data
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS partner_name TEXT,
  ADD COLUMN IF NOT EXISTS partner_instagram TEXT,
  ADD COLUMN IF NOT EXISTS partner_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS included TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS available_dates TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pickup_location TEXT,
  ADD COLUMN IF NOT EXISTS pickup_time TEXT,
  ADD COLUMN IF NOT EXISTS child_discount INTEGER DEFAULT 0;
