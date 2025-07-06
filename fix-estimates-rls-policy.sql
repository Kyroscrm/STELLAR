-- Fix Estimates RLS Policies - Resolve 403 Forbidden Error
-- This script fixes the Row Level Security policies for the estimates table

-- First, check current user authentication
DO $$
BEGIN
    RAISE NOTICE 'Current user: %', current_user;
    RAISE NOTICE 'Current role: %', current_role;
END $$;

-- Drop existing problematic policies for estimates
DROP POLICY IF EXISTS "estimates_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_select_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_insert_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_update_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_delete_policy" ON estimates;

-- Enable RLS on estimates table
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for estimates table
-- 1. SELECT policy - Users can read their own estimates + admin bypass
CREATE POLICY "estimates_select_policy" ON estimates
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'nayib@finalroofingcompany.com'
        )
    );

-- 2. INSERT policy - Users can create estimates for themselves
CREATE POLICY "estimates_insert_policy" ON estimates
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'nayib@finalroofingcompany.com'
        )
    );

-- 3. UPDATE policy - Users can update their own estimates
CREATE POLICY "estimates_update_policy" ON estimates
    FOR UPDATE
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'nayib@finalroofingcompany.com'
        )
    );

-- 4. DELETE policy - Users can delete their own estimates
CREATE POLICY "estimates_delete_policy" ON estimates
    FOR DELETE
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'nayib@finalroofingcompany.com'
        )
    );

-- Ensure estimate_line_items also has proper RLS policies
DROP POLICY IF EXISTS "estimate_line_items_select_policy" ON estimate_line_items;
DROP POLICY IF EXISTS "estimate_line_items_insert_policy" ON estimate_line_items;
DROP POLICY IF EXISTS "estimate_line_items_update_policy" ON estimate_line_items;
DROP POLICY IF EXISTS "estimate_line_items_delete_policy" ON estimate_line_items;

ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;

-- Estimate line items policies - based on parent estimate ownership
CREATE POLICY "estimate_line_items_select_policy" ON estimate_line_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM estimates
            WHERE estimates.id = estimate_line_items.estimate_id
            AND (
                estimates.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.email = 'nayib@finalroofingcompany.com'
                )
            )
        )
    );

CREATE POLICY "estimate_line_items_insert_policy" ON estimate_line_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM estimates
            WHERE estimates.id = estimate_line_items.estimate_id
            AND (
                estimates.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.email = 'nayib@finalroofingcompany.com'
                )
            )
        )
    );

CREATE POLICY "estimate_line_items_update_policy" ON estimate_line_items
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM estimates
            WHERE estimates.id = estimate_line_items.estimate_id
            AND (
                estimates.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.email = 'nayib@finalroofingcompany.com'
                )
            )
        )
    );

CREATE POLICY "estimate_line_items_delete_policy" ON estimate_line_items
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM estimates
            WHERE estimates.id = estimate_line_items.estimate_id
            AND (
                estimates.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.email = 'nayib@finalroofingcompany.com'
                )
            )
        )
    );

-- Test the policies with a simple query
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename IN ('estimates', 'estimate_line_items');

    RAISE NOTICE 'Total RLS policies created: %', policy_count;

    IF policy_count >= 8 THEN
        RAISE NOTICE 'SUCCESS: All RLS policies for estimates created successfully!';
    ELSE
        RAISE WARNING 'WARNING: Expected 8 policies, found %', policy_count;
    END IF;
END $$;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON estimates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON estimate_line_items TO authenticated;

COMMIT;
