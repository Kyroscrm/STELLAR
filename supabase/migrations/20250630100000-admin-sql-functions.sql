-- Create SQL functions to allow admin operations

-- Function to create a table
CREATE OR REPLACE FUNCTION public.create_table_rpc(
  table_name TEXT,
  column_definitions TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  create_sql TEXT;
BEGIN
  -- Make sure only admins can use this function
  IF NOT public.has_permission(auth.uid(), 'admin:settings') THEN
    RAISE EXCEPTION 'Permission denied: admin:settings required';
  END IF;

  create_sql := 'CREATE TABLE IF NOT EXISTS public.' || quote_ident(table_name) || ' (' || column_definitions || ')';
  EXECUTE create_sql;
END;
$$;

-- Function to drop a table
CREATE OR REPLACE FUNCTION public.drop_table_rpc(
  table_name TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Make sure only admins can use this function
  IF NOT public.has_permission(auth.uid(), 'admin:settings') THEN
    RAISE EXCEPTION 'Permission denied: admin:settings required';
  END IF;

  EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(table_name);
END;
$$;

-- Function to create an RLS policy
CREATE OR REPLACE FUNCTION public.create_policy_rpc(
  table_name TEXT,
  policy_name TEXT,
  policy_definition TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Make sure only admins can use this function
  IF NOT public.has_permission(auth.uid(), 'admin:settings') THEN
    RAISE EXCEPTION 'Permission denied: admin:settings required';
  END IF;

  -- Policy definition should contain the full CREATE POLICY statement
  EXECUTE policy_definition;
END;
$$;

-- Function to drop an RLS policy
CREATE OR REPLACE FUNCTION public.drop_policy_rpc(
  table_name TEXT,
  policy_name TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Make sure only admins can use this function
  IF NOT public.has_permission(auth.uid(), 'admin:settings') THEN
    RAISE EXCEPTION 'Permission denied: admin:settings required';
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || ' ON public.' || quote_ident(table_name);
END;
$$;

-- Function to execute arbitrary SQL (be very careful with this one!)
CREATE OR REPLACE FUNCTION public.execute_sql(
  sql_statement TEXT
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Make sure only admins can use this function
  IF NOT public.has_permission(auth.uid(), 'admin:settings') THEN
    RAISE EXCEPTION 'Permission denied: admin:settings required';
  END IF;

  -- We're executing arbitrary SQL here - this is extremely powerful and dangerous
  -- Limited to SELECT statements for safety
  IF NOT (sql_statement ILIKE 'SELECT%' OR sql_statement ILIKE 'SHOW%') THEN
    RAISE EXCEPTION 'Only SELECT and SHOW statements are allowed through this function';
  END IF;

  EXECUTE sql_statement INTO result;
  RETURN result;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.create_table_rpc TO authenticated;
GRANT EXECUTE ON FUNCTION public.drop_table_rpc TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_policy_rpc TO authenticated;
GRANT EXECUTE ON FUNCTION public.drop_policy_rpc TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated;
