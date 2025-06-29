-- Fix Time Entries Table - Remove Generated Column Dependency
-- Run this in Supabase Dashboard > SQL Editor

-- Drop the problematic table if it exists
DROP TABLE IF EXISTS time_entries CASCADE;

-- Create enums if they don't exist
DO $$ BEGIN
  CREATE TYPE time_entry_type AS ENUM ('regular', 'overtime', 'travel', 'break');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create Time Entries table with proper column structure
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  crew_id UUID REFERENCES crews(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  -- Calculate duration_hours as a generated column
  duration_hours DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN end_time IS NOT NULL
      THEN EXTRACT(EPOCH FROM (end_time - start_time))/3600
      ELSE NULL
    END
  ) STORED,
  entry_type time_entry_type DEFAULT 'regular',
  hourly_rate DECIMAL(10,2),
  -- Remove generated column for total_cost - we'll calculate this in application
  total_cost DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to calculate and update total_cost
CREATE OR REPLACE FUNCTION update_time_entry_total_cost()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total_cost when duration_hours or hourly_rate changes
  IF NEW.duration_hours IS NOT NULL AND NEW.hourly_rate IS NOT NULL THEN
    NEW.total_cost = NEW.duration_hours * NEW.hourly_rate;
  ELSE
    NEW.total_cost = 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update total_cost
CREATE TRIGGER trigger_update_time_entry_total_cost
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_time_entry_total_cost();

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create basic policy
CREATE POLICY "Enable access for all users" ON time_entries FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_crew_id ON time_entries(crew_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(DATE(start_time));

-- Test the table
SELECT 'time_entries table created successfully' as status;
