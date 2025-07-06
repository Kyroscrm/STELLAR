-- =================================================================
-- Cleanup Script for Conflicting has_permission functions
-- =================================================================
-- This script drops any existing versions of the public.has_permission
-- function to resolve conflicts caused by multiple definitions in
-- different SQL files.
--
-- Run this script BEFORE running complete-admin-setup.sql
-- =================================================================

-- Drop the function, accounting for the signature that causes the error.
-- We only need to specify the argument types, not their names.
DROP FUNCTION IF EXISTS public.has_permission(uuid, text) CASCADE;

-- Just in case there are other variations, this is redundant but safe.
DROP FUNCTION IF EXISTS public.has_permission(uuid, TEXT) CASCADE;


-- =================================================================
-- Cleanup Complete. You can now run the setup scripts.
-- =================================================================
