-- Enterprise Schema Completion Migration
-- Creating 12 new tables for full enterprise functionality

-- Create enums for type safety
DO $$ BEGIN
  CREATE TYPE crew_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE TYPE workflow_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 1. Crews table for managing work teams
CREATE TABLE IF NOT EXISTS crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES auth.users(id),
  status crew_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 2. Crew Members table for tracking team composition
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

-- 3. Materials table for inventory management
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

-- 4. Job Materials table for tracking material usage
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

-- 5. Time Entries table for tracking work hours
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

-- 6. Change Orders table for managing project modifications
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

-- 7. Recurring Invoices table for subscription billing
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

-- 8. Credit Notes table for refunds and adjustments
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

-- 9. Expenses table for tracking business costs
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

-- 10. Communication Templates table for standardized messaging
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

-- 11. Workflow Logs table for automation tracking
CREATE TABLE IF NOT EXISTS workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  trigger_event TEXT NOT NULL,
  status workflow_status DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  execution_data JSONB DEFAULT '{}'::jsonb,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_by UUID REFERENCES auth.users(id)
);

-- 12. Report Templates table for custom reporting
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crews_status ON crews(status);
CREATE INDEX IF NOT EXISTS idx_crews_lead_id ON crews(lead_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_crew_id ON crew_members(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_user_id ON crew_members(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_active ON crew_members(is_active);

CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_sku ON materials(sku);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);
CREATE INDEX IF NOT EXISTS idx_materials_stock ON materials(current_stock, minimum_stock);

CREATE INDEX IF NOT EXISTS idx_job_materials_job_id ON job_materials(job_id);
CREATE INDEX IF NOT EXISTS idx_job_materials_material_id ON job_materials(material_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_crew_id ON time_entries(crew_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(DATE(start_time));

CREATE INDEX IF NOT EXISTS idx_change_orders_job_id ON change_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);

CREATE INDEX IF NOT EXISTS idx_recurring_invoices_customer_id ON recurring_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_date ON recurring_invoices(next_invoice_date);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_active ON recurring_invoices(is_active);

CREATE INDEX IF NOT EXISTS idx_credit_notes_customer_id ON credit_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_number ON credit_notes(credit_note_number);
CREATE INDEX IF NOT EXISTS idx_credit_notes_status ON credit_notes(status);

CREATE INDEX IF NOT EXISTS idx_expenses_job_id ON expenses(job_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_billable ON expenses(is_billable);

CREATE INDEX IF NOT EXISTS idx_communication_templates_type ON communication_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_communication_templates_category ON communication_templates(category);
CREATE INDEX IF NOT EXISTS idx_communication_templates_active ON communication_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_workflow_logs_entity ON workflow_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_status ON workflow_logs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_workflow ON workflow_logs(workflow_name);

CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(report_type);
CREATE INDEX IF NOT EXISTS idx_report_templates_public ON report_templates(is_public);

-- Enable RLS on all new tables
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for each table
-- Crews policies
CREATE POLICY "Users can view crews they belong to" ON crews
  FOR SELECT USING (
    has_permission(auth.uid(), 'crews', 'read') OR
    lead_id = auth.uid() OR
    id IN (SELECT crew_id FROM crew_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create crews with permission" ON crews
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'crews', 'create'));

CREATE POLICY "Users can update crews they lead or with permission" ON crews
  FOR UPDATE USING (
    has_permission(auth.uid(), 'crews', 'update') OR
    lead_id = auth.uid()
  );

CREATE POLICY "Users can delete crews with permission" ON crews
  FOR DELETE USING (has_permission(auth.uid(), 'crews', 'delete'));

-- Crew Members policies
CREATE POLICY "Users can view crew members of crews they belong to" ON crew_members
  FOR SELECT USING (
    has_permission(auth.uid(), 'crew_members', 'read') OR
    user_id = auth.uid() OR
    crew_id IN (SELECT id FROM crews WHERE lead_id = auth.uid()) OR
    crew_id IN (SELECT crew_id FROM crew_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage crew members with permission or as crew lead" ON crew_members
  FOR ALL USING (
    has_permission(auth.uid(), 'crew_members', 'create') OR
    crew_id IN (SELECT id FROM crews WHERE lead_id = auth.uid())
  );

-- Materials policies
CREATE POLICY "Users can view materials with permission" ON materials
  FOR SELECT USING (has_permission(auth.uid(), 'materials', 'read'));

CREATE POLICY "Users can manage materials with permission" ON materials
  FOR ALL USING (has_permission(auth.uid(), 'materials', 'create'));

-- Job Materials policies
CREATE POLICY "Users can view job materials for jobs they can access" ON job_materials
  FOR SELECT USING (
    has_permission(auth.uid(), 'job_materials', 'read') OR
    job_id IN (SELECT id FROM jobs WHERE has_permission(auth.uid(), 'jobs', 'read'))
  );

CREATE POLICY "Users can manage job materials with permission" ON job_materials
  FOR ALL USING (has_permission(auth.uid(), 'job_materials', 'create'));

-- Time Entries policies
CREATE POLICY "Users can view their own time entries or with permission" ON time_entries
  FOR SELECT USING (
    user_id = auth.uid() OR
    has_permission(auth.uid(), 'time_entries', 'read')
  );

CREATE POLICY "Users can create their own time entries" ON time_entries
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    has_permission(auth.uid(), 'time_entries', 'create')
  );

CREATE POLICY "Users can update their own time entries or with permission" ON time_entries
  FOR UPDATE USING (
    user_id = auth.uid() OR
    has_permission(auth.uid(), 'time_entries', 'update')
  );

-- Change Orders policies
CREATE POLICY "Users can view change orders for accessible jobs" ON change_orders
  FOR SELECT USING (
    has_permission(auth.uid(), 'change_orders', 'read') OR
    job_id IN (SELECT id FROM jobs WHERE has_permission(auth.uid(), 'jobs', 'read'))
  );

CREATE POLICY "Users can manage change orders with permission" ON change_orders
  FOR ALL USING (has_permission(auth.uid(), 'change_orders', 'create'));

-- Recurring Invoices policies
CREATE POLICY "Users can view recurring invoices with permission" ON recurring_invoices
  FOR SELECT USING (has_permission(auth.uid(), 'recurring_invoices', 'read'));

CREATE POLICY "Users can manage recurring invoices with permission" ON recurring_invoices
  FOR ALL USING (has_permission(auth.uid(), 'recurring_invoices', 'create'));

-- Credit Notes policies
CREATE POLICY "Users can view credit notes with permission" ON credit_notes
  FOR SELECT USING (has_permission(auth.uid(), 'credit_notes', 'read'));

CREATE POLICY "Users can manage credit notes with permission" ON credit_notes
  FOR ALL USING (has_permission(auth.uid(), 'credit_notes', 'create'));

-- Expenses policies
CREATE POLICY "Users can view their own expenses or with permission" ON expenses
  FOR SELECT USING (
    created_by = auth.uid() OR
    has_permission(auth.uid(), 'expenses', 'read')
  );

CREATE POLICY "Users can create expenses" ON expenses
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'expenses', 'create'));

CREATE POLICY "Users can update their own expenses or with permission" ON expenses
  FOR UPDATE USING (
    created_by = auth.uid() OR
    has_permission(auth.uid(), 'expenses', 'update')
  );

-- Communication Templates policies
CREATE POLICY "Users can view communication templates with permission" ON communication_templates
  FOR SELECT USING (has_permission(auth.uid(), 'communication_templates', 'read'));

CREATE POLICY "Users can manage communication templates with permission" ON communication_templates
  FOR ALL USING (has_permission(auth.uid(), 'communication_templates', 'create'));

-- Workflow Logs policies
CREATE POLICY "Users can view workflow logs with permission" ON workflow_logs
  FOR SELECT USING (has_permission(auth.uid(), 'workflow_logs', 'read'));

CREATE POLICY "System can create workflow logs" ON workflow_logs
  FOR INSERT WITH CHECK (true);

-- Report Templates policies
CREATE POLICY "Users can view public report templates or their own" ON report_templates
  FOR SELECT USING (
    is_public = true OR
    created_by = auth.uid() OR
    has_permission(auth.uid(), 'report_templates', 'read')
  );

CREATE POLICY "Users can manage their own report templates or with permission" ON report_templates
  FOR ALL USING (
    created_by = auth.uid() OR
    has_permission(auth.uid(), 'report_templates', 'create')
  );

-- Create audit triggers for all new tables
SELECT audit_table('crews');
SELECT audit_table('crew_members');
SELECT audit_table('materials');
SELECT audit_table('job_materials');
SELECT audit_table('time_entries');
SELECT audit_table('change_orders');
SELECT audit_table('recurring_invoices');
SELECT audit_table('credit_notes');
SELECT audit_table('expenses');
SELECT audit_table('communication_templates');
SELECT audit_table('workflow_logs');
SELECT audit_table('report_templates');

-- Create functions for common operations
CREATE OR REPLACE FUNCTION generate_credit_note_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  result TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(credit_note_number FROM 'CN-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM credit_notes
  WHERE credit_note_number ~ '^CN-\d+$';

  result := 'CN-' || LPAD(next_num::TEXT, 6, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check low stock materials
CREATE OR REPLACE FUNCTION get_low_stock_materials()
RETURNS TABLE (
  id UUID,
  name TEXT,
  current_stock INTEGER,
  minimum_stock INTEGER,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.name, m.current_stock, m.minimum_stock, m.category
  FROM materials m
  WHERE m.current_stock <= m.minimum_stock
    AND m.is_active = true
  ORDER BY (m.current_stock::FLOAT / NULLIF(m.minimum_stock, 0)) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate total project costs
CREATE OR REPLACE FUNCTION calculate_project_costs(job_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  material_costs DECIMAL(10,2) := 0;
  labor_costs DECIMAL(10,2) := 0;
  expense_costs DECIMAL(10,2) := 0;
  change_order_costs DECIMAL(10,2) := 0;
  result JSONB;
BEGIN
  -- Calculate material costs
  SELECT COALESCE(SUM(total_cost), 0)
  INTO material_costs
  FROM job_materials
  WHERE job_id = job_uuid;

  -- Calculate labor costs
  SELECT COALESCE(SUM(total_cost), 0)
  INTO labor_costs
  FROM time_entries
  WHERE job_id = job_uuid AND approved = true;

  -- Calculate expense costs
  SELECT COALESCE(SUM(total_amount), 0)
  INTO expense_costs
  FROM expenses
  WHERE job_id = job_uuid AND approved = true;

  -- Calculate approved change order costs
  SELECT COALESCE(SUM(cost_impact), 0)
  INTO change_order_costs
  FROM change_orders
  WHERE job_id = job_uuid AND status = 'approved';

  result := jsonb_build_object(
    'material_costs', material_costs,
    'labor_costs', labor_costs,
    'expense_costs', expense_costs,
    'change_order_costs', change_order_costs,
    'total_costs', material_costs + labor_costs + expense_costs + change_order_costs
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION generate_credit_note_number() TO authenticated;
GRANT EXECUTE ON FUNCTION get_low_stock_materials() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_project_costs(UUID) TO authenticated;
