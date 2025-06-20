
-- Create enum types for better data consistency (with proper error handling)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
        CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source') THEN
        CREATE TYPE lead_source AS ENUM ('website', 'referral', 'google_ads', 'facebook', 'direct_mail', 'cold_call', 'trade_show', 'other');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM ('quoted', 'scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estimate_status') THEN
        CREATE TYPE estimate_status AS ENUM ('draft', 'sent', 'viewed', 'approved', 'rejected', 'expired');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
        CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff', 'client');
    END IF;
END $$;

-- Core user profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'client',
    avatar_url TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    source lead_source DEFAULT 'website',
    status lead_status DEFAULT 'new',
    score INTEGER DEFAULT 0,
    notes TEXT,
    estimated_value DECIMAL(10,2),
    expected_close_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table (converted from leads)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    company_name TEXT,
    notes TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs/Projects table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status job_status DEFAULT 'quoted',
    start_date DATE,
    end_date DATE,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    budget DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'pending',
    priority task_priority DEFAULT 'medium',
    due_date DATE,
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estimates table
CREATE TABLE IF NOT EXISTS estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    estimate_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status estimate_status DEFAULT 'draft',
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estimate line items
CREATE TABLE IF NOT EXISTS estimate_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(8,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(8,2) NOT NULL,
    total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    estimate_id UUID REFERENCES estimates(id) ON DELETE SET NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status invoice_status DEFAULT 'draft',
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    due_date DATE,
    payment_terms TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(8,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(8,2) NOT NULL,
    total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    transaction_id TEXT,
    status payment_status DEFAULT 'pending',
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_type TEXT,
    entity_id UUID,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    attendees TEXT[],
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
    -- Profiles policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    
    CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

    -- Leads policies
    DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
    DROP POLICY IF EXISTS "Users can create leads" ON leads;
    DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
    DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;
    
    CREATE POLICY "Users can view their own leads" ON leads FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create leads" ON leads FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own leads" ON leads FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own leads" ON leads FOR DELETE USING (auth.uid() = user_id);

    -- Customers policies
    DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
    DROP POLICY IF EXISTS "Users can create customers" ON customers;
    DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
    DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;
    
    CREATE POLICY "Users can view their own customers" ON customers FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

    -- Jobs policies
    DROP POLICY IF EXISTS "Users can view their own jobs" ON jobs;
    DROP POLICY IF EXISTS "Users can create jobs" ON jobs;
    DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
    DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;
    
    CREATE POLICY "Users can view their own jobs" ON jobs FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own jobs" ON jobs FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own jobs" ON jobs FOR DELETE USING (auth.uid() = user_id);

    -- Tasks policies
    DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
    DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
    DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
    DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
    
    CREATE POLICY "Users can view their own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

    -- Estimates policies
    DROP POLICY IF EXISTS "Users can view their own estimates" ON estimates;
    DROP POLICY IF EXISTS "Users can create estimates" ON estimates;
    DROP POLICY IF EXISTS "Users can update their own estimates" ON estimates;
    DROP POLICY IF EXISTS "Users can delete their own estimates" ON estimates;
    
    CREATE POLICY "Users can view their own estimates" ON estimates FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create estimates" ON estimates FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own estimates" ON estimates FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own estimates" ON estimates FOR DELETE USING (auth.uid() = user_id);

    -- Estimate line items policies
    DROP POLICY IF EXISTS "Users can view their own estimate line items" ON estimate_line_items;
    DROP POLICY IF EXISTS "Users can create estimate line items" ON estimate_line_items;
    DROP POLICY IF EXISTS "Users can update their own estimate line items" ON estimate_line_items;
    DROP POLICY IF EXISTS "Users can delete their own estimate line items" ON estimate_line_items;
    
    CREATE POLICY "Users can view their own estimate line items" ON estimate_line_items FOR SELECT 
    USING (EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_line_items.estimate_id AND estimates.user_id = auth.uid()));
    CREATE POLICY "Users can create estimate line items" ON estimate_line_items FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_line_items.estimate_id AND estimates.user_id = auth.uid()));
    CREATE POLICY "Users can update their own estimate line items" ON estimate_line_items FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_line_items.estimate_id AND estimates.user_id = auth.uid()));
    CREATE POLICY "Users can delete their own estimate line items" ON estimate_line_items FOR DELETE 
    USING (EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_line_items.estimate_id AND estimates.user_id = auth.uid()));

    -- Invoices policies
    DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
    DROP POLICY IF EXISTS "Users can create invoices" ON invoices;
    DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
    DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;
    
    CREATE POLICY "Users can view their own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own invoices" ON invoices FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own invoices" ON invoices FOR DELETE USING (auth.uid() = user_id);

    -- Invoice line items policies
    DROP POLICY IF EXISTS "Users can view their own invoice line items" ON invoice_line_items;
    DROP POLICY IF EXISTS "Users can create invoice line items" ON invoice_line_items;
    DROP POLICY IF EXISTS "Users can update their own invoice line items" ON invoice_line_items;
    DROP POLICY IF EXISTS "Users can delete their own invoice line items" ON invoice_line_items;
    
    CREATE POLICY "Users can view their own invoice line items" ON invoice_line_items FOR SELECT 
    USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.user_id = auth.uid()));
    CREATE POLICY "Users can create invoice line items" ON invoice_line_items FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.user_id = auth.uid()));
    CREATE POLICY "Users can update their own invoice line items" ON invoice_line_items FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.user_id = auth.uid()));
    CREATE POLICY "Users can delete their own invoice line items" ON invoice_line_items FOR DELETE 
    USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.user_id = auth.uid()));

    -- Payments policies
    DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
    DROP POLICY IF EXISTS "Users can create payments" ON payments;
    DROP POLICY IF EXISTS "Users can update their own payments" ON payments;
    DROP POLICY IF EXISTS "Users can delete their own payments" ON payments;
    
    CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own payments" ON payments FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own payments" ON payments FOR DELETE USING (auth.uid() = user_id);

    -- Activity logs policies
    DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
    DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;
    
    CREATE POLICY "Users can view their own activity logs" ON activity_logs FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create activity logs" ON activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Documents policies
    DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
    DROP POLICY IF EXISTS "Users can create documents" ON documents;
    DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
    DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
    
    CREATE POLICY "Users can view their own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

    -- Calendar events policies
    DROP POLICY IF EXISTS "Users can view their own calendar events" ON calendar_events;
    DROP POLICY IF EXISTS "Users can create calendar events" ON calendar_events;
    DROP POLICY IF EXISTS "Users can update their own calendar events" ON calendar_events;
    DROP POLICY IF EXISTS "Users can delete their own calendar events" ON calendar_events;
    
    CREATE POLICY "Users can view their own calendar events" ON calendar_events FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create calendar events" ON calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own calendar events" ON calendar_events FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own calendar events" ON calendar_events FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_estimates_updated_at ON estimates;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON estimates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update estimate totals
CREATE OR REPLACE FUNCTION update_estimate_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE estimates 
    SET 
        subtotal = (SELECT COALESCE(SUM(total), 0) FROM estimate_line_items WHERE estimate_id = COALESCE(NEW.estimate_id, OLD.estimate_id)),
        tax_amount = (SELECT COALESCE(SUM(total), 0) * tax_rate FROM estimate_line_items WHERE estimate_id = COALESCE(NEW.estimate_id, OLD.estimate_id) GROUP BY estimate_id LIMIT 1),
        total_amount = (SELECT COALESCE(SUM(total), 0) FROM estimate_line_items WHERE estimate_id = COALESCE(NEW.estimate_id, OLD.estimate_id)) + 
                      (SELECT COALESCE(SUM(total), 0) * tax_rate FROM estimate_line_items WHERE estimate_id = COALESCE(NEW.estimate_id, OLD.estimate_id) GROUP BY estimate_id LIMIT 1)
    WHERE id = COALESCE(NEW.estimate_id, OLD.estimate_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices 
    SET 
        subtotal = (SELECT COALESCE(SUM(total), 0) FROM invoice_line_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)),
        tax_amount = (SELECT COALESCE(SUM(total), 0) * tax_rate FROM invoice_line_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id) GROUP BY invoice_id LIMIT 1),
        total_amount = (SELECT COALESCE(SUM(total), 0) FROM invoice_line_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)) + 
                      (SELECT COALESCE(SUM(total), 0) * tax_rate FROM invoice_line_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id) GROUP BY invoice_id LIMIT 1)
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_estimate_totals_trigger ON estimate_line_items;
DROP TRIGGER IF EXISTS update_invoice_totals_trigger ON invoice_line_items;

CREATE TRIGGER update_estimate_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON estimate_line_items
    FOR EACH ROW EXECUTE FUNCTION update_estimate_totals();

CREATE TRIGGER update_invoice_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
    FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_job_id ON tasks(job_id);
CREATE INDEX IF NOT EXISTS idx_estimates_user_id ON estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
