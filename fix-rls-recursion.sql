-- Fix infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS on system tables to prevent recursion
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "roles_select_policy" ON public.roles;
DROP POLICY IF EXISTS "permissions_select_policy" ON public.permissions;
DROP POLICY IF EXISTS "role_permissions_select_policy" ON public.role_permissions;

-- Create simple, non-recursive policies
CREATE POLICY "roles_read_authenticated" ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "permissions_read_authenticated" ON public.permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "role_permissions_read_authenticated" ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin-only write policies
CREATE POLICY "roles_write_admin" ON public.roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "permissions_write_admin" ON public.permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "role_permissions_write_admin" ON public.role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Re-enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Verify the setup
SELECT 'Setup complete' as status;
