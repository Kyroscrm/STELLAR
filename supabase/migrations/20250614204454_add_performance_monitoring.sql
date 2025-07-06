-- Create performance_logs table
CREATE TABLE IF NOT EXISTS public.performance_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    operation text NOT NULL,
    duration_ms integer NOT NULL,
    timestamp timestamptz NOT NULL DEFAULT now(),
    success boolean NOT NULL,
    error_type text,
    details jsonb,
    created_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert logs
CREATE POLICY "Allow authenticated users to insert logs"
    ON public.performance_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to view their org's logs
CREATE POLICY "Allow authenticated users to view logs"
    ON public.performance_logs
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT user_id
            FROM user_organizations
            WHERE organization_id IN (
                SELECT organization_id
                FROM user_organizations
                WHERE user_id = auth.uid()
            )
        )
    );

-- Create health_check table for monitoring
CREATE TABLE IF NOT EXISTS public.health_check (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    count integer DEFAULT 1,
    last_checked timestamptz DEFAULT now()
);

-- Insert initial health check record
INSERT INTO public.health_check (count) VALUES (1);

-- Add RLS policies for health_check
ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view health check
CREATE POLICY "Allow authenticated users to view health check"
    ON public.health_check
    FOR SELECT
    TO authenticated
    USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_logs_timestamp
    ON public.performance_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_logs_operation
    ON public.performance_logs(operation);
CREATE INDEX IF NOT EXISTS idx_performance_logs_error_type
    ON public.performance_logs(error_type);

-- Create function to clean old logs
CREATE OR REPLACE FUNCTION clean_old_performance_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.performance_logs
    WHERE timestamp < now() - interval '30 days';
END;
$$;
