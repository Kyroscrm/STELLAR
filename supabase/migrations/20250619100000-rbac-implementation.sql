-- RBAC Implementation: Roles, Permissions, and Access Control
-- This migration adds a complete role-based access control system to the application

-- 1. Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- 4. Check if profiles table exists and add role_id column if it does
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);
  END IF;
END$$;

-- 5. Create has_permission function
CREATE OR REPLACE FUNCTION public.has_permission(
  user_id UUID,
  permission_name TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  user_role_id UUID;
  perm_count INT;
BEGIN
  -- Get user's role_id from profiles
  SELECT role_id INTO user_role_id
  FROM public.profiles
  WHERE id = user_id;

  -- If no role assigned, return false
  IF user_role_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Count matching permissions for the user's role
  SELECT COUNT(*) INTO perm_count
  FROM public.role_permissions rp
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE rp.role_id = user_role_id
    AND p.name = permission_name;

  -- Return true if at least one permission matches
  RETURN perm_count > 0;
END;
$$;

-- 6. Seed initial roles
INSERT INTO public.roles (name, description)
VALUES
  ('admin', 'Administrator with full system access'),
  ('sales_rep', 'Sales representative with access to leads and customers'),
  ('project_manager', 'Project manager with access to jobs and tasks'),
  ('accountant', 'Accountant with access to invoices and financial data'),
  ('client', 'External client with limited access to their own data')
ON CONFLICT (name) DO NOTHING;

-- 7. Seed initial permissions
INSERT INTO public.permissions (name, description)
VALUES
  -- Lead permissions
  ('leads:read', 'Can view leads'),
  ('leads:create', 'Can create leads'),
  ('leads:update', 'Can update leads'),
  ('leads:delete', 'Can delete leads'),

  -- Customer permissions
  ('customers:read', 'Can view customers'),
  ('customers:create', 'Can create customers'),
  ('customers:update', 'Can update customers'),
  ('customers:delete', 'Can delete customers'),

  -- Estimate permissions
  ('estimates:read', 'Can view estimates'),
  ('estimates:create', 'Can create estimates'),
  ('estimates:update', 'Can update estimates'),
  ('estimates:delete', 'Can delete estimates'),

  -- Invoice permissions
  ('invoices:read', 'Can view invoices'),
  ('invoices:create', 'Can create invoices'),
  ('invoices:update', 'Can update invoices'),
  ('invoices:delete', 'Can delete invoices'),

  -- Job permissions
  ('jobs:read', 'Can view jobs'),
  ('jobs:create', 'Can create jobs'),
  ('jobs:update', 'Can update jobs'),
  ('jobs:delete', 'Can delete jobs'),

  -- Task permissions
  ('tasks:read', 'Can view tasks'),
  ('tasks:create', 'Can create tasks'),
  ('tasks:update', 'Can update tasks'),
  ('tasks:delete', 'Can delete tasks'),

  -- Activity log permissions
  ('activity_logs:read', 'Can view activity logs'),
  ('activity_logs:create', 'Can create activity logs'),

  -- User management permissions
  ('users:read', 'Can view user information'),
  ('users:create', 'Can create users'),
  ('users:update', 'Can update users'),
  ('users:delete', 'Can delete users')
ON CONFLICT (name) DO NOTHING;

-- 8. Assign permissions to roles
DO $$
DECLARE
  admin_role_id UUID;
  sales_rep_role_id UUID;
  project_manager_role_id UUID;
  accountant_role_id UUID;
  client_role_id UUID;

  -- Permission IDs
  -- Leads
  leads_read_id UUID;
  leads_create_id UUID;
  leads_update_id UUID;
  leads_delete_id UUID;

  -- Customers
  customers_read_id UUID;
  customers_create_id UUID;
  customers_update_id UUID;
  customers_delete_id UUID;

  -- Estimates
  estimates_read_id UUID;
  estimates_create_id UUID;
  estimates_update_id UUID;
  estimates_delete_id UUID;

  -- Invoices
  invoices_read_id UUID;
  invoices_create_id UUID;
  invoices_update_id UUID;
  invoices_delete_id UUID;

  -- Jobs
  jobs_read_id UUID;
  jobs_create_id UUID;
  jobs_update_id UUID;
  jobs_delete_id UUID;

  -- Tasks
  tasks_read_id UUID;
  tasks_create_id UUID;
  tasks_update_id UUID;
  tasks_delete_id UUID;

  -- Activity logs
  activity_logs_read_id UUID;
  activity_logs_create_id UUID;

  -- Users
  users_read_id UUID;
  users_create_id UUID;
  users_update_id UUID;
  users_delete_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
  SELECT id INTO sales_rep_role_id FROM public.roles WHERE name = 'sales_rep';
  SELECT id INTO project_manager_role_id FROM public.roles WHERE name = 'project_manager';
  SELECT id INTO accountant_role_id FROM public.roles WHERE name = 'accountant';
  SELECT id INTO client_role_id FROM public.roles WHERE name = 'client';

  -- Get permission IDs
  -- Leads
  SELECT id INTO leads_read_id FROM public.permissions WHERE name = 'leads:read';
  SELECT id INTO leads_create_id FROM public.permissions WHERE name = 'leads:create';
  SELECT id INTO leads_update_id FROM public.permissions WHERE name = 'leads:update';
  SELECT id INTO leads_delete_id FROM public.permissions WHERE name = 'leads:delete';

  -- Customers
  SELECT id INTO customers_read_id FROM public.permissions WHERE name = 'customers:read';
  SELECT id INTO customers_create_id FROM public.permissions WHERE name = 'customers:create';
  SELECT id INTO customers_update_id FROM public.permissions WHERE name = 'customers:update';
  SELECT id INTO customers_delete_id FROM public.permissions WHERE name = 'customers:delete';

  -- Estimates
  SELECT id INTO estimates_read_id FROM public.permissions WHERE name = 'estimates:read';
  SELECT id INTO estimates_create_id FROM public.permissions WHERE name = 'estimates:create';
  SELECT id INTO estimates_update_id FROM public.permissions WHERE name = 'estimates:update';
  SELECT id INTO estimates_delete_id FROM public.permissions WHERE name = 'estimates:delete';

  -- Invoices
  SELECT id INTO invoices_read_id FROM public.permissions WHERE name = 'invoices:read';
  SELECT id INTO invoices_create_id FROM public.permissions WHERE name = 'invoices:create';
  SELECT id INTO invoices_update_id FROM public.permissions WHERE name = 'invoices:update';
  SELECT id INTO invoices_delete_id FROM public.permissions WHERE name = 'invoices:delete';

  -- Jobs
  SELECT id INTO jobs_read_id FROM public.permissions WHERE name = 'jobs:read';
  SELECT id INTO jobs_create_id FROM public.permissions WHERE name = 'jobs:create';
  SELECT id INTO jobs_update_id FROM public.permissions WHERE name = 'jobs:update';
  SELECT id INTO jobs_delete_id FROM public.permissions WHERE name = 'jobs:delete';

  -- Tasks
  SELECT id INTO tasks_read_id FROM public.permissions WHERE name = 'tasks:read';
  SELECT id INTO tasks_create_id FROM public.permissions WHERE name = 'tasks:create';
  SELECT id INTO tasks_update_id FROM public.permissions WHERE name = 'tasks:update';
  SELECT id INTO tasks_delete_id FROM public.permissions WHERE name = 'tasks:delete';

  -- Activity logs
  SELECT id INTO activity_logs_read_id FROM public.permissions WHERE name = 'activity_logs:read';
  SELECT id INTO activity_logs_create_id FROM public.permissions WHERE name = 'activity_logs:create';

  -- Users
  SELECT id INTO users_read_id FROM public.permissions WHERE name = 'users:read';
  SELECT id INTO users_create_id FROM public.permissions WHERE name = 'users:create';
  SELECT id INTO users_update_id FROM public.permissions WHERE name = 'users:update';
  SELECT id INTO users_delete_id FROM public.permissions WHERE name = 'users:delete';

  -- Assign permissions to Admin role (all permissions)
  -- Leads
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, leads_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, leads_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, leads_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, leads_delete_id) ON CONFLICT DO NOTHING;

  -- Customers
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, customers_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, customers_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, customers_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, customers_delete_id) ON CONFLICT DO NOTHING;

  -- Estimates
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, estimates_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, estimates_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, estimates_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, estimates_delete_id) ON CONFLICT DO NOTHING;

  -- Invoices
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, invoices_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, invoices_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, invoices_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, invoices_delete_id) ON CONFLICT DO NOTHING;

  -- Jobs
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, jobs_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, jobs_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, jobs_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, jobs_delete_id) ON CONFLICT DO NOTHING;

  -- Tasks
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, tasks_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, tasks_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, tasks_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, tasks_delete_id) ON CONFLICT DO NOTHING;

  -- Activity logs
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, activity_logs_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, activity_logs_create_id) ON CONFLICT DO NOTHING;

  -- Users
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, users_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, users_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, users_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (admin_role_id, users_delete_id) ON CONFLICT DO NOTHING;

  -- Assign permissions to Sales Rep role
  -- Leads (full access)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, leads_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, leads_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, leads_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, leads_delete_id) ON CONFLICT DO NOTHING;

  -- Customers (full access)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, customers_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, customers_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, customers_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, customers_delete_id) ON CONFLICT DO NOTHING;

  -- Estimates (full access)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, estimates_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, estimates_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, estimates_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, estimates_delete_id) ON CONFLICT DO NOTHING;

  -- Jobs (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, jobs_read_id) ON CONFLICT DO NOTHING;

  -- Activity logs (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, activity_logs_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (sales_rep_role_id, activity_logs_create_id) ON CONFLICT DO NOTHING;

  -- Assign permissions to Project Manager role
  -- Jobs (full access)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, jobs_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, jobs_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, jobs_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, jobs_delete_id) ON CONFLICT DO NOTHING;

  -- Tasks (full access)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, tasks_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, tasks_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, tasks_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, tasks_delete_id) ON CONFLICT DO NOTHING;

  -- Customers (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, customers_read_id) ON CONFLICT DO NOTHING;

  -- Estimates (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, estimates_read_id) ON CONFLICT DO NOTHING;

  -- Activity logs (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, activity_logs_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (project_manager_role_id, activity_logs_create_id) ON CONFLICT DO NOTHING;

  -- Assign permissions to Accountant role
  -- Invoices (full access)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (accountant_role_id, invoices_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (accountant_role_id, invoices_create_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (accountant_role_id, invoices_update_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (accountant_role_id, invoices_delete_id) ON CONFLICT DO NOTHING;

  -- Estimates (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (accountant_role_id, estimates_read_id) ON CONFLICT DO NOTHING;

  -- Customers (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (accountant_role_id, customers_read_id) ON CONFLICT DO NOTHING;

  -- Jobs (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (accountant_role_id, jobs_read_id) ON CONFLICT DO NOTHING;

  -- Activity logs (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (accountant_role_id, activity_logs_read_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (accountant_role_id, activity_logs_create_id) ON CONFLICT DO NOTHING;

  -- Assign permissions to Client role (very limited access)
  -- Estimates (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (client_role_id, estimates_read_id) ON CONFLICT DO NOTHING;

  -- Invoices (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (client_role_id, invoices_read_id) ON CONFLICT DO NOTHING;

  -- Jobs (read-only)
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (client_role_id, jobs_read_id) ON CONFLICT DO NOTHING;
END$$;

-- 9. Update RLS policies for tables
-- Note: We'll update the policies for each table to use the has_permission function

-- Leads table policies
DROP POLICY IF EXISTS "Allow select for leads" ON public.leads;
CREATE POLICY "Allow select for leads" ON public.leads
  FOR SELECT USING (has_permission(auth.uid(), 'leads:read'));

DROP POLICY IF EXISTS "Allow insert for leads" ON public.leads;
CREATE POLICY "Allow insert for leads" ON public.leads
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'leads:create'));

DROP POLICY IF EXISTS "Allow update for leads" ON public.leads;
CREATE POLICY "Allow update for leads" ON public.leads
  FOR UPDATE USING (has_permission(auth.uid(), 'leads:update'));

DROP POLICY IF EXISTS "Allow delete for leads" ON public.leads;
CREATE POLICY "Allow delete for leads" ON public.leads
  FOR DELETE USING (has_permission(auth.uid(), 'leads:delete'));

-- Customers table policies
DROP POLICY IF EXISTS "Allow select for customers" ON public.customers;
CREATE POLICY "Allow select for customers" ON public.customers
  FOR SELECT USING (has_permission(auth.uid(), 'customers:read'));

DROP POLICY IF EXISTS "Allow insert for customers" ON public.customers;
CREATE POLICY "Allow insert for customers" ON public.customers
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'customers:create'));

DROP POLICY IF EXISTS "Allow update for customers" ON public.customers;
CREATE POLICY "Allow update for customers" ON public.customers
  FOR UPDATE USING (has_permission(auth.uid(), 'customers:update'));

DROP POLICY IF EXISTS "Allow delete for customers" ON public.customers;
CREATE POLICY "Allow delete for customers" ON public.customers
  FOR DELETE USING (has_permission(auth.uid(), 'customers:delete'));

-- Estimates table policies
DROP POLICY IF EXISTS "Allow select for estimates" ON public.estimates;
CREATE POLICY "Allow select for estimates" ON public.estimates
  FOR SELECT USING (has_permission(auth.uid(), 'estimates:read'));

DROP POLICY IF EXISTS "Allow insert for estimates" ON public.estimates;
CREATE POLICY "Allow insert for estimates" ON public.estimates
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'estimates:create'));

DROP POLICY IF EXISTS "Allow update for estimates" ON public.estimates;
CREATE POLICY "Allow update for estimates" ON public.estimates
  FOR UPDATE USING (has_permission(auth.uid(), 'estimates:update'));

DROP POLICY IF EXISTS "Allow delete for estimates" ON public.estimates;
CREATE POLICY "Allow delete for estimates" ON public.estimates
  FOR DELETE USING (has_permission(auth.uid(), 'estimates:delete'));

-- Invoices table policies
DROP POLICY IF EXISTS "Allow select for invoices" ON public.invoices;
CREATE POLICY "Allow select for invoices" ON public.invoices
  FOR SELECT USING (has_permission(auth.uid(), 'invoices:read'));

DROP POLICY IF EXISTS "Allow insert for invoices" ON public.invoices;
CREATE POLICY "Allow insert for invoices" ON public.invoices
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'invoices:create'));

DROP POLICY IF EXISTS "Allow update for invoices" ON public.invoices;
CREATE POLICY "Allow update for invoices" ON public.invoices
  FOR UPDATE USING (has_permission(auth.uid(), 'invoices:update'));

DROP POLICY IF EXISTS "Allow delete for invoices" ON public.invoices;
CREATE POLICY "Allow delete for invoices" ON public.invoices
  FOR DELETE USING (has_permission(auth.uid(), 'invoices:delete'));

-- Jobs table policies
DROP POLICY IF EXISTS "Allow select for jobs" ON public.jobs;
CREATE POLICY "Allow select for jobs" ON public.jobs
  FOR SELECT USING (has_permission(auth.uid(), 'jobs:read'));

DROP POLICY IF EXISTS "Allow insert for jobs" ON public.jobs;
CREATE POLICY "Allow insert for jobs" ON public.jobs
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'jobs:create'));

DROP POLICY IF EXISTS "Allow update for jobs" ON public.jobs;
CREATE POLICY "Allow update for jobs" ON public.jobs
  FOR UPDATE USING (has_permission(auth.uid(), 'jobs:update'));

DROP POLICY IF EXISTS "Allow delete for jobs" ON public.jobs;
CREATE POLICY "Allow delete for jobs" ON public.jobs
  FOR DELETE USING (has_permission(auth.uid(), 'jobs:delete'));

-- Tasks table policies
DROP POLICY IF EXISTS "Allow select for tasks" ON public.tasks;
CREATE POLICY "Allow select for tasks" ON public.tasks
  FOR SELECT USING (has_permission(auth.uid(), 'tasks:read'));

DROP POLICY IF EXISTS "Allow insert for tasks" ON public.tasks;
CREATE POLICY "Allow insert for tasks" ON public.tasks
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'tasks:create'));

DROP POLICY IF EXISTS "Allow update for tasks" ON public.tasks;
CREATE POLICY "Allow update for tasks" ON public.tasks
  FOR UPDATE USING (has_permission(auth.uid(), 'tasks:update'));

DROP POLICY IF EXISTS "Allow delete for tasks" ON public.tasks;
CREATE POLICY "Allow delete for tasks" ON public.tasks
  FOR DELETE USING (has_permission(auth.uid(), 'tasks:delete'));

-- Activity logs table policies
DROP POLICY IF EXISTS "Allow select for activity_logs" ON public.activity_logs;
CREATE POLICY "Allow select for activity_logs" ON public.activity_logs
  FOR SELECT USING (has_permission(auth.uid(), 'activity_logs:read'));

DROP POLICY IF EXISTS "Allow insert for activity_logs" ON public.activity_logs;
CREATE POLICY "Allow insert for activity_logs" ON public.activity_logs
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'activity_logs:create'));

-- 10. Create default role assignment for new users
-- This trigger will assign the 'client' role to new users by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Get the client role ID
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'client';

  -- If we have a profiles table, assign the default role
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    UPDATE public.profiles
    SET role_id = default_role_id
    WHERE id = NEW.id AND role_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
