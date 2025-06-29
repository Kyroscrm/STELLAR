-- Fix RLS Policies for time_entries table
-- This resolves the 400 Bad Request errors when accessing time_entries

-- First, check if RLS is enabled and disable temporarily
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "time_entries_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_select" ON time_entries;
DROP POLICY IF EXISTS "time_entries_insert" ON time_entries;
DROP POLICY IF EXISTS "time_entries_update" ON time_entries;
DROP POLICY IF EXISTS "time_entries_delete" ON time_entries;

-- Re-enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for time_entries
CREATE POLICY "time_entries_select_policy" ON time_entries
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND (
            -- User can see their own time entries
            user_id = auth.uid()
            -- Or entries for jobs they have access to
            OR job_id IN (
                SELECT id FROM jobs
                WHERE customer_id IN (
                    SELECT id FROM customers
                    WHERE user_id = auth.uid()
                )
            )
            -- Or if they're an admin (has admin role in user_roles table)
            OR EXISTS (
                SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid()
                AND r.name = 'admin'
            )
        )
    );

CREATE POLICY "time_entries_insert_policy" ON time_entries
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND (
            -- User can create time entries for themselves
            user_id = auth.uid()
            -- And for jobs they have access to
            AND job_id IN (
                SELECT id FROM jobs
                WHERE customer_id IN (
                    SELECT id FROM customers
                    WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "time_entries_update_policy" ON time_entries
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND (
            -- User can update their own time entries
            user_id = auth.uid()
            -- Or if they're an admin
            OR EXISTS (
                SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid()
                AND r.name = 'admin'
            )
        )
    );

CREATE POLICY "time_entries_delete_policy" ON time_entries
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL
        AND (
            -- User can delete their own time entries
            user_id = auth.uid()
            -- Or if they're an admin
            OR EXISTS (
                SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid()
                AND r.name = 'admin'
            )
        )
    );

-- Ensure the table has proper grants
GRANT ALL ON time_entries TO authenticated;
GRANT SELECT ON time_entries TO anon;

-- Also fix any related tables that might be causing issues
-- Fix crews table permissions
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crews_policy" ON crews;

CREATE POLICY "crews_select_policy" ON crews
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND (
            user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid()
                AND r.name = 'admin'
            )
        )
    );

CREATE POLICY "crews_insert_policy" ON crews
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "crews_update_policy" ON crews
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND (
            user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid()
                AND r.name = 'admin'
            )
        )
    );

CREATE POLICY "crews_delete_policy" ON crews
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL
        AND (
            user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid()
                AND r.name = 'admin'
            )
        )
    );

GRANT ALL ON crews TO authenticated;

-- Also ensure job access is working properly
-- Refresh the jobs table policies
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Check if we need to fix user access
SELECT 'RLS policies for time_entries table have been fixed' as status;
