-- Migrate existing profile roles to the new RBAC system
-- This migration updates existing profiles by setting their role_id based on their current role enum value

-- First, ensure we have the roles table and it has our standard roles
INSERT INTO public.roles (name, description)
VALUES
  ('admin', 'Administrator with full system access'),
  ('sales_rep', 'Sales representative with access to leads and customers'),
  ('project_manager', 'Project manager with access to jobs and tasks'),
  ('accountant', 'Accountant with access to invoices and financial data'),
  ('client', 'External client with limited access to their own data')
ON CONFLICT (name) DO NOTHING;

-- Create a function to migrate profiles
CREATE OR REPLACE FUNCTION migrate_profile_roles()
RETURNS void AS $$
DECLARE
  admin_role_id UUID;
  manager_role_id UUID;
  staff_role_id UUID;
  client_role_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
  SELECT id INTO manager_role_id FROM public.roles WHERE name = 'project_manager'; -- Map 'manager' to 'project_manager'
  SELECT id INTO staff_role_id FROM public.roles WHERE name = 'sales_rep'; -- Map 'staff' to 'sales_rep'
  SELECT id INTO client_role_id FROM public.roles WHERE name = 'client';

  -- Update profiles with admin role
  UPDATE public.profiles
  SET role_id = admin_role_id
  WHERE role = 'admin' AND role_id IS NULL;

  -- Update profiles with manager role
  UPDATE public.profiles
  SET role_id = manager_role_id
  WHERE role = 'manager' AND role_id IS NULL;

  -- Update profiles with staff role
  UPDATE public.profiles
  SET role_id = staff_role_id
  WHERE role = 'staff' AND role_id IS NULL;

  -- Update profiles with client role
  UPDATE public.profiles
  SET role_id = client_role_id
  WHERE role = 'client' AND role_id IS NULL;

  -- Set default role for any profiles without a role
  UPDATE public.profiles
  SET role_id = client_role_id
  WHERE role_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_profile_roles();

-- Drop the function after use
DROP FUNCTION migrate_profile_roles();

-- Create a trigger to keep role and role_id in sync for backward compatibility
CREATE OR REPLACE FUNCTION sync_profile_role_fields()
RETURNS TRIGGER AS $$
DECLARE
  role_name TEXT;
BEGIN
  -- If role_id is updated, update the role enum field
  IF NEW.role_id IS NOT NULL AND (OLD.role_id IS NULL OR NEW.role_id != OLD.role_id) THEN
    SELECT name INTO role_name FROM public.roles WHERE id = NEW.role_id;

    -- Map role names to the existing enum values
    IF role_name = 'admin' THEN
      NEW.role := 'admin';
    ELSIF role_name = 'project_manager' OR role_name = 'manager' THEN
      NEW.role := 'manager';
    ELSIF role_name = 'sales_rep' OR role_name = 'staff' THEN
      NEW.role := 'staff';
    ELSIF role_name = 'client' THEN
      NEW.role := 'client';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_profile_roles_trigger ON public.profiles;
CREATE TRIGGER sync_profile_roles_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION sync_profile_role_fields();

-- Update the get_current_user_role function to use the new RBAC system
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT r.name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();
$$;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = user_id AND r.name = 'admin'
  );
$$;
