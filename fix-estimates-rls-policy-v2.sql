-- Migration: Fix Estimates RLS Policies V2
-- This resolves the 403 Forbidden error and consolidates duplicate policies

-- First, verify the current user and their permissions
DO $$
BEGIN
    RAISE NOTICE 'Current user: %', current_user;
    RAISE NOTICE 'Current auth.uid(): %', auth.uid();
END $$;

-- Drop ALL existing policies on estimates
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname
               FROM pg_policies
               WHERE tablename = 'estimates'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON estimates', pol.policyname);
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Create a single admin full access policy
CREATE POLICY "estimates_admin_access" ON estimates
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE users.id = auth.uid()
            AND users.email = 'nayib@finalroofingcompany.com'
        )
    );

-- Create consolidated user policies with broader access
CREATE POLICY "estimates_user_select" ON estimates
    FOR SELECT
    TO authenticated
    USING (
        -- User owns the estimate
        user_id = auth.uid()
        OR
        -- User created the estimate
        created_by = auth.uid()
        OR
        -- User is associated with the estimate through a customer relationship
        EXISTS (
            SELECT 1 FROM customers c
            WHERE c.id = estimates.customer_id
            AND (
                c.user_id = auth.uid()
                OR c.created_by = auth.uid()
            )
        )
    );

CREATE POLICY "estimates_user_insert" ON estimates
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Any authenticated user can create estimates
        auth.uid() IS NOT NULL
    );

CREATE POLICY "estimates_user_update" ON estimates
    FOR UPDATE
    TO authenticated
    USING (
        -- User owns the estimate
        user_id = auth.uid()
        OR
        -- User created the estimate
        created_by = auth.uid()
        OR
        -- User is associated with the estimate through a customer relationship
        EXISTS (
            SELECT 1 FROM customers c
            WHERE c.id = estimates.customer_id
            AND (
                c.user_id = auth.uid()
                OR c.created_by = auth.uid()
            )
        )
    );

CREATE POLICY "estimates_user_delete" ON estimates
    FOR DELETE
    TO authenticated
    USING (
        -- User owns the estimate
        user_id = auth.uid()
        OR
        -- User created the estimate
        created_by = auth.uid()
        OR
        -- User is associated with the estimate through a customer relationship
        EXISTS (
            SELECT 1 FROM customers c
            WHERE c.id = estimates.customer_id
            AND (
                c.user_id = auth.uid()
                OR c.created_by = auth.uid()
            )
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON estimates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON estimate_line_items TO authenticated;

-- Verify the policies were created
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'estimates';
