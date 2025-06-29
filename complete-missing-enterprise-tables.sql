-- Complete Missing Enterprise Tables
-- Run this in Supabase Dashboard > SQL Editor

-- Create missing enums first
DO $$ BEGIN
  CREATE TYPE crew_member_role AS ENUM ('lead', 'member', 'apprentice');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE time_entry_type AS ENUM ('regular', 'overtime', 'travel', 'break');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE change_order_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE recurring_frequency AS ENUM ('weekly', 'monthly', 'quarterly', 'annually');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM ('materials', 'equipment', 'travel', 'supplies', 'subcontractor', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 1. Crew Members table
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role crew_member_role DEFAULT 'member',
  hourly_rate DECIMAL(10,2),
  joined_date DATE DEFAULT CURRENT_DATE,
  left_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crew_id, user_id)
);

-- 2. Materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 10,
  supplier TEXT,
  sku TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 3. Job Materials table
CREATE TABLE IF NOT EXISTS job_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id),
  quantity_needed DECIMAL(10,2) NOT NULL,
  quantity_used DECIMAL(10,2) DEFAULT 0,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity_used * cost_per_unit) STORED,
  allocated_date TIMESTAMPTZ DEFAULT NOW(),
  used_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Time Entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  crew_id UUID REFERENCES crews(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_hours DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN end_time IS NOT NULL
      THEN EXTRACT(EPOCH FROM (end_time - start_time))/3600
      ELSE NULL
    END
  ) STORED,
  entry_type time_entry_type DEFAULT 'regular',
  hourly_rate DECIMAL(10,2),
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE
      WHEN duration_hours IS NOT NULL AND hourly_rate IS NOT NULL
      THEN duration_hours * hourly_rate
      ELSE NULL
    END
  ) STORED,
  description TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Change Orders table
CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reason TEXT,
  cost_impact DECIMAL(10,2) DEFAULT 0,
  time_impact_days INTEGER DEFAULT 0,
  status change_order_status DEFAULT 'pending',
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  requested_date TIMESTAMPTZ DEFAULT NOW(),
  approved_date TIMESTAMPTZ,
  customer_approval_required BOOLEAN DEFAULT true,
  customer_approved BOOLEAN DEFAULT false,
  customer_approved_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Recurring Invoices table
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  template_invoice_id UUID REFERENCES invoices(id),
  frequency recurring_frequency NOT NULL,
  next_invoice_date DATE NOT NULL,
  end_date DATE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  last_generated_date DATE,
  total_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 7. Credit Notes table
CREATE TABLE IF NOT EXISTS credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  original_invoice_id UUID REFERENCES invoices(id),
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'applied', 'void')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  applied_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 8. Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  category expense_category NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor TEXT,
  receipt_url TEXT,
  is_billable BOOLEAN DEFAULT false,
  is_reimbursable BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 9. Communication Templates table
CREATE TABLE IF NOT EXISTS communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('email', 'sms', 'letter')),
  category TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 10. Report Templates table
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  query_definition JSONB NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  schedule JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all new tables
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- Create basic policies (allowing all for now, we'll restrict later)
CREATE POLICY "Enable access for all users" ON crew_members FOR ALL USING (true);
CREATE POLICY "Enable access for all users" ON materials FOR ALL USING (true);
CREATE POLICY "Enable access for all users" ON job_materials FOR ALL USING (true);
CREATE POLICY "Enable access for all users" ON time_entries FOR ALL USING (true);
CREATE POLICY "Enable access for all users" ON change_orders FOR ALL USING (true);
CREATE POLICY "Enable access for all users" ON recurring_invoices FOR ALL USING (true);
CREATE POLICY "Enable access for all users" ON credit_notes FOR ALL USING (true);
CREATE POLICY "Enable access for all users" ON expenses FOR ALL USING (true);
CREATE POLICY "Enable access for all users" ON communication_templates FOR ALL USING (true);
CREATE POLICY "Enable access for all users" ON report_templates FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crew_members_crew_id ON crew_members(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_user_id ON crew_members(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_sku ON materials(sku);
CREATE INDEX IF NOT EXISTS idx_job_materials_job_id ON job_materials(job_id);
CREATE INDEX IF NOT EXISTS idx_job_materials_material_id ON job_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_job_id ON change_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_customer_id ON recurring_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_customer_id ON credit_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_job_id ON expenses(job_id);

-- Verification query
SELECT
  'Enterprise Tables Created' as status,
  COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'crews', 'crew_members', 'materials', 'job_materials',
    'time_entries', 'change_orders', 'recurring_invoices',
    'credit_notes', 'expenses', 'communication_templates',
    'workflow_logs', 'report_templates'
  );
