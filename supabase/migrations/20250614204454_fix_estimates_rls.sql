-- Fix RLS policies for estimates table
BEGIN;

-- First ensure RLS is enabled
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON estimates;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON estimates;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON estimates;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON estimates;
DROP POLICY IF EXISTS "estimates_select_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_insert_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_update_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_delete_policy" ON estimates;

-- Create comprehensive select policy
CREATE POLICY "estimates_select_policy" ON estimates
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create comprehensive insert policy
CREATE POLICY "estimates_insert_policy" ON estimates
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create comprehensive update policy
CREATE POLICY "estimates_update_policy" ON estimates
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create comprehensive delete policy
CREATE POLICY "estimates_delete_policy" ON estimates
    FOR DELETE
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Verify RLS is enabled and working
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE tablename = 'estimates'
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS not enabled on estimates table';
    END IF;
END $$;

COMMIT;
