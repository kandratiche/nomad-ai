-- ═══════════════════════════════════════════════════════════
-- Migration 003: Fix users table RLS policies
-- Users need to read all profiles and update their own
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Enable RLS if not already
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Everyone can read user profiles (for guide cards, avatars, etc.)
DO $$ BEGIN
  CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users can update their own profile (become guide, edit info)
DO $$ BEGIN
  CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users can insert their own profile row
DO $$ BEGIN
  CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
