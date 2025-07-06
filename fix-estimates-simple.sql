-- Simple fix for estimates RLS
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON estimates;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON estimates;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON estimates;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON estimates;
DROP POLICY IF EXISTS "estimates_select_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_insert_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_update_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_delete_policy" ON estimates;

-- Create a single, simple policy that allows full access to authenticated users
CREATE POLICY "authenticated_full_access" ON estimates
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON estimates TO authenticated;
GRANT ALL ON estimates TO service_role;
