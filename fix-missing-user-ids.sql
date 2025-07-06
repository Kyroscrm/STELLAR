-- =================================================================
-- Fix Missing user_id columns in time_entries and change_orders
-- =================================================================
-- This script adds a user_id column to the time_entries and
-- change_orders tables, which is required for the new RLS policies.
--
-- Run this script BEFORE running rebuild-rls-policies.sql
-- =================================================================

-- Add user_id column to time_entries table
ALTER TABLE public.time_entries
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to change_orders table
ALTER TABLE public.change_orders
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_user_id ON public.change_orders(user_id);


-- =================================================================
-- Fix Complete. You can now run the rebuild-rls-policies.sql script.
-- =================================================================
