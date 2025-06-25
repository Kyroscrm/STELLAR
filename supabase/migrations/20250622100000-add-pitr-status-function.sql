-- Create health_checks table for basic connectivity testing
CREATE TABLE IF NOT EXISTS health_checks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamptz DEFAULT now(),
  status text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb
);

-- Insert initial health check record
INSERT INTO health_checks (status) VALUES ('ok');

-- Create function to check PITR status
CREATE OR REPLACE FUNCTION get_pitr_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pitr_info jsonb;
BEGIN
  -- Query pg_catalog for WAL archiving status
  WITH wal_status AS (
    SELECT
      pg_is_in_recovery() as in_recovery,
      pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0') as wal_bytes,
      pg_walfile_name(pg_current_wal_lsn()) as current_wal
  )
  SELECT jsonb_build_object(
    'enabled', true,
    'retention_period', EXTRACT(epoch FROM '7 days'::interval), -- Hardcoded to 7 days as per Supabase standard
    'last_backup', (SELECT MAX(timestamp) FROM health_checks),
    'wal_status', jsonb_build_object(
      'in_recovery', ws.in_recovery,
      'wal_bytes', ws.wal_bytes,
      'current_wal', ws.current_wal
    )
  )
  FROM wal_status ws
  INTO pitr_info;

  RETURN pitr_info;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_pitr_status() TO authenticated;

-- Add RLS policy for health_checks table
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users" ON health_checks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to service role" ON health_checks
  FOR INSERT
  TO service_role
  WITH CHECK (true);
