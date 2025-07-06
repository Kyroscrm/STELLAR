-- Comprehensive fix for estimates table
BEGIN;

-- 1. Ensure table has correct structure
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estimates' AND column_name = 'user_id') THEN
        ALTER TABLE estimates ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estimates' AND column_name = 'job_id') THEN
        ALTER TABLE estimates ADD COLUMN job_id UUID REFERENCES jobs(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estimates' AND column_name = 'status') THEN
        ALTER TABLE estimates ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estimates' AND column_name = 'created_at') THEN
        ALTER TABLE estimates ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estimates' AND column_name = 'updated_at') THEN
        ALTER TABLE estimates ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- 2. Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS estimates_updated_at ON estimates;
CREATE TRIGGER estimates_updated_at
    BEFORE UPDATE ON estimates
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- 3. Reset and recreate RLS policies
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

-- 4. Grant necessary permissions
GRANT ALL ON estimates TO authenticated;
GRANT ALL ON estimates TO service_role;

-- 5. Update any null user_ids with the creator's id
UPDATE estimates
SET user_id = auth.uid()
WHERE user_id IS NULL;

-- 6. Add not null constraint if it doesn't exist
ALTER TABLE estimates
ALTER COLUMN user_id SET NOT NULL;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS estimates_user_id_idx ON estimates(user_id);
CREATE INDEX IF NOT EXISTS estimates_job_id_idx ON estimates(job_id);
CREATE INDEX IF NOT EXISTS estimates_status_idx ON estimates(status);

-- 8. Verify setup
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'estimates'
AND schemaname = 'public';

COMMIT;
