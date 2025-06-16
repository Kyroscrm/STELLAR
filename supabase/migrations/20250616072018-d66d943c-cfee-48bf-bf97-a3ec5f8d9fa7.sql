
-- Create function to get user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.profiles WHERE id = user_id),
    'user'::text
  );
$$;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT public.get_user_role(user_id) = 'admin';
$$;

-- RLS POLICIES FOR CUSTOMERS TABLE
DROP POLICY IF EXISTS "Admin full access to customers" ON public.customers;
DROP POLICY IF EXISTS "Users can manage own customers" ON public.customers;

CREATE POLICY "Admin full access to customers"
ON public.customers
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage own customers"
ON public.customers
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- RLS POLICIES FOR LEADS TABLE
DROP POLICY IF EXISTS "Admin full access to leads" ON public.leads;
DROP POLICY IF EXISTS "Users can manage own leads" ON public.leads;

CREATE POLICY "Admin full access to leads"
ON public.leads
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage own leads"
ON public.leads
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- RLS POLICIES FOR JOBS TABLE
DROP POLICY IF EXISTS "Admin full access to jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can manage own jobs" ON public.jobs;

CREATE POLICY "Admin full access to jobs"
ON public.jobs
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage own jobs"
ON public.jobs
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- RLS POLICIES FOR TASKS TABLE
DROP POLICY IF EXISTS "Admin full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;

CREATE POLICY "Admin full access to tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage own tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- RLS POLICIES FOR ESTIMATES TABLE
DROP POLICY IF EXISTS "Admin full access to estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can manage own estimates" ON public.estimates;

CREATE POLICY "Admin full access to estimates"
ON public.estimates
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage own estimates"
ON public.estimates
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- RLS POLICIES FOR INVOICES TABLE
DROP POLICY IF EXISTS "Admin full access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can manage own invoices" ON public.invoices;

CREATE POLICY "Admin full access to invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage own invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- RLS POLICIES FOR CALENDAR_EVENTS TABLE
DROP POLICY IF EXISTS "Admin full access to calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can manage own calendar_events" ON public.calendar_events;

CREATE POLICY "Admin full access to calendar_events"
ON public.calendar_events
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage own calendar_events"
ON public.calendar_events
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- RLS POLICIES FOR ACTIVITY_LOGS TABLE (Admin read-only, users can insert their own)
DROP POLICY IF EXISTS "Admin can read all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.activity_logs;

CREATE POLICY "Admin can read all activity logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert own activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create activity logging function
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    description,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_description,
    COALESCE(p_metadata, '{}'::jsonb)
  );
END;
$$;
