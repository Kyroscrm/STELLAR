#!/usr/bin/env node

// Simple script to create the necessary SQL migration for estimates RLS fix
console.log('🔧 Creating Estimates RLS Policy Fix Migration...\n');

const migrationSQL = `
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
`;

// Write the migration to a file
import { writeFileSync } from 'fs';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `supabase/migrations/${timestamp.split('T')[0]}_fix_estimates_rls_policies.sql`;

try {
    writeFileSync(filename, migrationSQL);
    console.log(`✅ Migration created: ${filename}`);
    console.log('\n📝 To apply this migration:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Database > SQL Editor');
    console.log('3. Copy and paste the SQL from the migration file');
    console.log('4. Click "Run" to execute the migration');
    console.log('\n🎯 This will fix the 403 Forbidden error on estimates!');
} catch (error) {
    console.error('❌ Failed to create migration:', error.message);
}

console.log('\n🔍 ISSUE ANALYSIS:');
console.log('The 403 Forbidden error occurs because:');
console.log('1. RLS policies on estimates table are missing or misconfigured');
console.log('2. User 28dc0c62-8e09-44e3-9497-5f62c6a0b436 cannot access estimates');
console.log('3. The query includes user_id filter but RLS policy blocks access');
console.log('\n💡 SOLUTION:');
console.log('The migration creates proper RLS policies that allow:');
console.log('1. Users to access their own estimates (user_id = auth.uid())');
console.log('2. Admin bypass for nayib@finalroofingcompany.com');
console.log('3. Proper permissions for estimate_line_items based on parent estimate');
