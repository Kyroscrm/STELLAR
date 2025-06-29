-- Add Simple Time Entries Table
-- Run this in Supabase Dashboard > SQL Editor

-- Create time entry type enum if not exists
DO $$ BEGIN
  CREATE TYPE time_entry_type AS ENUM ('regular', 'overtime', 'travel', 'break');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create Time Entries table (simple version - no generated columns)
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  crew_id UUID REFERENCES crews(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  -- Simple duration field - calculated by application or trigger
  duration_hours DECIMAL(5,2) DEFAULT 0,
  entry_type time_entry_type DEFAULT 'regular',
  hourly_rate DECIMAL(10,2),
  -- Simple total_cost field
  total_cost DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to calculate duration and total cost
CREATE OR REPLACE FUNCTION update_time_entry_calculations()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate duration_hours if both start_time and end_time are present
  IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    NEW.duration_hours = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))/3600;
  ELSE
    NEW.duration_hours = 0;
  END IF;

  -- Calculate total_cost
  IF NEW.duration_hours IS NOT NULL AND NEW.hourly_rate IS NOT NULL THEN
    NEW.total_cost = NEW.duration_hours * NEW.hourly_rate;
  ELSE
    NEW.total_cost = 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate fields
CREATE TRIGGER trigger_time_entry_calculations
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_time_entry_calculations();

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create basic policy
CREATE POLICY "Enable access for all users" ON time_entries FOR ALL USING (true);

-- Create simple indexes (no function-based indexes)
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_crew_id ON time_entries(crew_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_approved ON time_entries(approved);

-- Test the table
INSERT INTO time_entries (job_id, user_id, start_time, end_time, hourly_rate, description)
SELECT
  j.id,
  (SELECT id FROM auth.users LIMIT 1),
  NOW() - INTERVAL '2 hours',
  NOW(),
  25.00,
  'Test time entry'
FROM jobs j
LIMIT 1;

-- Verify the calculation worked
SELECT
  id,
  start_time,
  end_time,
  duration_hours,
  hourly_rate,
  total_cost,
  description
FROM time_entries
WHERE description = 'Test time entry';

-- Clean up test data
DELETE FROM time_entries WHERE description = 'Test time entry';

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

SELECT 'Simple time_entries table created successfully!' as status;
