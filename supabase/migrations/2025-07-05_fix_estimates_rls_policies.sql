
-- Migration: Fix Estimates RLS Policies
-- This resolves the 403 Forbidden error when accessing estimates

-- Drop existing problematic policies
DROP POLICY IF EXISTS "estimates_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_select_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_insert_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_update_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_delete_policy" ON estimates;

-- Enable RLS
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Create fixed RLS policies for estimates
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

-- Fix estimate_line_items policies
DROP POLICY IF EXISTS "estimate_line_items_select_policy" ON estimate_line_items;
DROP POLICY IF EXISTS "estimate_line_items_insert_policy" ON estimate_line_items;
DROP POLICY IF EXISTS "estimate_line_items_update_policy" ON estimate_line_items;
DROP POLICY IF EXISTS "estimate_line_items_delete_policy" ON estimate_line_items;

ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;

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

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON estimates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON estimate_line_items TO authenticated;
