-- Reset and recreate RLS policies for estimates table
BEGIN;

-- First disable RLS to clean up
ALTER TABLE estimates DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON estimates;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON estimates;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON estimates;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON estimates;
DROP POLICY IF EXISTS "estimates_select_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_insert_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_update_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_delete_policy" ON estimates;

-- Re-enable RLS
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Create new comprehensive policies
CREATE POLICY "estimates_select_policy" ON estimates
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'manager')
        )
        OR
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = estimates.job_id
            AND jobs.user_id = auth.uid()
        )
    );

CREATE POLICY "estimates_insert_policy" ON estimates
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'manager')
        )
    );

CREATE POLICY "estimates_update_policy" ON estimates
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'manager')
        )
    )
    WITH CHECK (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'manager')
        )
    );

CREATE POLICY "estimates_delete_policy" ON estimates
    FOR DELETE
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'manager')
        )
    );

-- Grant necessary permissions
GRANT ALL ON estimates TO authenticated;
GRANT ALL ON estimates TO service_role;

-- Verify policies are created
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'estimates'
AND schemaname = 'public';

COMMIT;
