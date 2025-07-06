-- =================================================================
-- Purge ALL RLS Policies from Core CRM Tables
-- =================================================================
-- WARNING: This is a destructive action.
-- This script iterates through all policies on the specified tables
-- and drops them to ensure a completely clean state before rebuilding.
--
-- Run this script BEFORE complete-admin-setup.sql and
-- rebuild-rls-policies.sql.
-- =================================================================

DO $$
DECLARE
    policy_record RECORD;
    table_name TEXT;
    -- Array of all tables that need to be purged
    tables_to_purge TEXT[] := ARRAY[
        'leads',
        'customers',
        'jobs',
        'estimates',
        'invoices',
        'tasks',
        'time_entries',
        'change_orders',
        'estimate_line_items',
        'invoice_line_items',
        'payments',
        'documents'
    ];
BEGIN
    -- Loop through each table name in the array
    FOREACH table_name IN ARRAY tables_to_purge
    LOOP
        -- Find all policies associated with the current table
        FOR policy_record IN
            SELECT policyname FROM pg_policies WHERE tablename = table_name AND schemaname = 'public'
        LOOP
            -- Dynamically build and execute the DROP POLICY command
            EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public."' || table_name || '";';
            RAISE NOTICE 'Dropped policy "%" on table "%"', policy_record.policyname, table_name;
        END LOOP;
    END LOOP;
END;
$$;

-- =================================================================
-- Purge Complete. You can now run the setup and rebuild scripts.
-- =================================================================
