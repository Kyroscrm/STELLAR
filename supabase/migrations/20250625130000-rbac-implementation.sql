-- RBAC Implementation Migration
-- Creates roles, permissions, and role_permissions tables with proper RLS policies

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    resource TEXT NOT NULL, -- e.g., 'leads', 'customers', 'jobs'
    action TEXT NOT NULL,   -- e.g., 'read', 'write', 'delete'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Add role_id to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role_id') THEN
        ALTER TABLE public.profiles ADD COLUMN role_id UUID REFERENCES public.roles(id);
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
    ('admin', 'Full system administrator with all permissions'),
    ('manager', 'Business manager with most permissions except system admin'),
    ('user', 'Standard user with basic CRUD permissions'),
    ('client', 'Client portal user with read-only access to their data')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO public.permissions (name, description, resource, action) VALUES
    -- Lead permissions
    ('leads:read', 'View leads', 'leads', 'read'),
    ('leads:write', 'Create and update leads', 'leads', 'write'),
    ('leads:delete', 'Delete leads', 'leads', 'delete'),

    -- Customer permissions
    ('customers:read', 'View customers', 'customers', 'read'),
    ('customers:write', 'Create and update customers', 'customers', 'write'),
    ('customers:delete', 'Delete customers', 'customers', 'delete'),

    -- Job permissions
    ('jobs:read', 'View jobs', 'jobs', 'read'),
    ('jobs:write', 'Create and update jobs', 'jobs', 'write'),
    ('jobs:delete', 'Delete jobs', 'jobs', 'delete'),

    -- Task permissions
    ('tasks:read', 'View tasks', 'tasks', 'read'),
    ('tasks:write', 'Create and update tasks', 'tasks', 'write'),
    ('tasks:delete', 'Delete tasks', 'tasks', 'delete'),

    -- Estimate permissions
    ('estimates:read', 'View estimates', 'estimates', 'read'),
    ('estimates:write', 'Create and update estimates', 'estimates', 'write'),
    ('estimates:delete', 'Delete estimates', 'estimates', 'delete'),

    -- Invoice permissions
    ('invoices:read', 'View invoices', 'invoices', 'read'),
    ('invoices:write', 'Create and update invoices', 'invoices', 'write'),
    ('invoices:delete', 'Delete invoices', 'invoices', 'delete'),

    -- Admin permissions
    ('admin:users', 'Manage users and roles', 'admin', 'write'),
    ('admin:settings', 'Manage system settings', 'admin', 'write'),
    ('admin:reports', 'Access admin reports', 'admin', 'read')
ON CONFLICT (name) DO NOTHING;

-- Set up role permissions
WITH role_permission_setup AS (
    SELECT
        r.id as role_id,
        p.id as permission_id
    FROM public.roles r
    CROSS JOIN public.permissions p
    WHERE
        -- Admin gets all permissions
        (r.name = 'admin') OR
        -- Manager gets most permissions except admin
        (r.name = 'manager' AND p.resource != 'admin') OR
        -- User gets basic CRUD permissions
        (r.name = 'user' AND p.resource IN ('leads', 'customers', 'jobs', 'tasks', 'estimates', 'invoices')) OR
        -- Client gets only read permissions for their own data
        (r.name = 'client' AND p.action = 'read' AND p.resource IN ('jobs', 'estimates', 'invoices'))
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT role_id, permission_id FROM role_permission_setup
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create enhanced permission checking function
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    has_perm BOOLEAN := FALSE;
BEGIN
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM public.profiles p
        JOIN public.roles r ON p.role_id = r.id
        JOIN public.role_permissions rp ON r.id = rp.role_id
        JOIN public.permissions perm ON rp.permission_id = perm.id
        WHERE p.id = user_id AND perm.name = permission_name
    ) INTO has_perm;

    RETURN has_perm;
END;
$$;

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(permission_name TEXT, resource TEXT, action TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF user_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT p.name, p.resource, p.action
    FROM public.profiles prof
    JOIN public.roles r ON prof.role_id = r.id
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE prof.id = user_id;
END;
$$;

-- Create RLS policies for RBAC tables

-- Roles table policies
CREATE POLICY "Admin can manage roles" ON public.roles
    FOR ALL USING (public.has_permission(auth.uid(), 'admin:users'));

CREATE POLICY "Users can view roles" ON public.roles
    FOR SELECT USING (true);

-- Permissions table policies
CREATE POLICY "Admin can manage permissions" ON public.permissions
    FOR ALL USING (public.has_permission(auth.uid(), 'admin:users'));

CREATE POLICY "Users can view permissions" ON public.permissions
    FOR SELECT USING (true);

-- Role permissions table policies
CREATE POLICY "Admin can manage role permissions" ON public.role_permissions
    FOR ALL USING (public.has_permission(auth.uid(), 'admin:users'));

CREATE POLICY "Users can view role permissions" ON public.role_permissions
    FOR SELECT USING (true);

-- Set default role for new users (trigger)
CREATE OR REPLACE FUNCTION public.set_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Get the 'user' role ID
    SELECT id INTO default_role_id
    FROM public.roles
    WHERE name = 'user'
    LIMIT 1;

    -- Set the role_id if not already set
    IF NEW.role_id IS NULL AND default_role_id IS NOT NULL THEN
        NEW.role_id := default_role_id;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger to set default role
DROP TRIGGER IF EXISTS set_default_role_trigger ON public.profiles;
CREATE TRIGGER set_default_role_trigger
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_default_role();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON public.permissions(resource, action);
