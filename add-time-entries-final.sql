-- Add Final Time Entries Table
-- Run this in Supabase Dashboard > SQL Editor

-- Create time entry type enum if not exists
DO $$ BEGIN
  CREATE TYPE time_entry_type AS ENUM ('regular', 'overtime', 'travel', 'break');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create Time Entries table (simplified - no circular dependencies)
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  crew_id UUID REFERENCES crews(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  -- Keep duration_hours as a simple calculated field
  duration_hours DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN end_time IS NOT NULL
      THEN EXTRACT(EPOCH FROM (end_time - start_time))/3600
      ELSE NULL
    END
  ) STORED,
  entry_type time_entry_type DEFAULT 'regular',
  hourly_rate DECIMAL(10,2),
  -- Simple total_cost field updated by trigger
  total_cost DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to update total_cost
CREATE OR REPLACE FUNCTION update_time_entry_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total cost using duration_hours (which is auto-calculated)
  IF NEW.hourly_rate IS NOT NULL THEN
    -- We'll calculate this in the application layer to avoid dependency issues
    NEW.total_cost = COALESCE(NEW.hourly_rate *
      CASE
        WHEN NEW.end_time IS NOT NULL
        THEN EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))/3600
        ELSE 0
      END, 0);
  ELSE
    NEW.total_cost = 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_time_entry_total
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_time_entry_total();

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create basic policy
CREATE POLICY "Enable access for all users" ON time_entries FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_crew_id ON time_entries(crew_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(DATE(start_time));

-- Final verification - should show 12 tables
SELECT
  COUNT(*) as all_enterprise_tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'crews', 'crew_members', 'materials', 'job_materials',
    'time_entries', 'change_orders', 'recurring_invoices',
    'credit_notes', 'expenses', 'communication_templates',
    'workflow_logs', 'report_templates'
  );

SELECT 'time_entries table added successfully!' as status;
