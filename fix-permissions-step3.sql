-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(polname) || ' ON ' || quote_ident(schemaname) || '.' || quote_ident(tablename) || ';', E'\n')
        FROM pg_policies
        WHERE schemaname = 'public'
    );
END $$;

-- Recreate policies for all tables
DO $$
DECLARE
    tables text[] := ARRAY['leads', 'customers', 'jobs', 'estimates', 'invoices', 'tasks', 'time_entries', 'change_orders'];
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY tables
    LOOP
        -- Select policy
        EXECUTE format($policy$
            CREATE POLICY "%1$s_select_policy" ON public.%1$s
            FOR SELECT USING (
                has_permission(auth.uid(), '%1$s:read') AND
                (user_id = auth.uid() OR has_permission(auth.uid(), '%1$s:read:all'))
            )
        $policy$, table_name);

        -- Insert policy
        EXECUTE format($policy$
            CREATE POLICY "%1$s_insert_policy" ON public.%1$s
            FOR INSERT WITH CHECK (
                has_permission(auth.uid(), '%1$s:create')
            )
        $policy$, table_name);

        -- Update policy
        EXECUTE format($policy$
            CREATE POLICY "%1$s_update_policy" ON public.%1$s
            FOR UPDATE USING (
                has_permission(auth.uid(), '%1$s:update') AND
                (user_id = auth.uid() OR has_permission(auth.uid(), '%1$s:update:all'))
            )
        $policy$, table_name);

        -- Delete policy
        EXECUTE format($policy$
            CREATE POLICY "%1$s_delete_policy" ON public.%1$s
            FOR DELETE USING (
                has_permission(auth.uid(), '%1$s:delete') AND
                (user_id = auth.uid() OR has_permission(auth.uid(), '%1$s:delete:all'))
            )
        $policy$, table_name);
    END LOOP;
END $$;
