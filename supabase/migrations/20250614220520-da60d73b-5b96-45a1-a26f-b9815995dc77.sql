
-- Ensure all tables have proper RLS policies for nested relationships

-- RLS policies for customers table
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

CREATE POLICY "Users can view their own customers" 
  ON public.customers 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customers" 
  ON public.customers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" 
  ON public.customers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" 
  ON public.customers 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for leads table
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

CREATE POLICY "Users can view their own leads" 
  ON public.leads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" 
  ON public.leads 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" 
  ON public.leads 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for jobs table
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;

CREATE POLICY "Users can view their own jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs" 
  ON public.jobs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" 
  ON public.jobs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for tasks table
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "Users can view their own tasks" 
  ON public.tasks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
  ON public.tasks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
  ON public.tasks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for estimates table
DROP POLICY IF EXISTS "Users can view their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update their own estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete their own estimates" ON public.estimates;

CREATE POLICY "Users can view their own estimates" 
  ON public.estimates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own estimates" 
  ON public.estimates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estimates" 
  ON public.estimates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estimates" 
  ON public.estimates 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for estimate_line_items table (nested through estimates)
DROP POLICY IF EXISTS "Users can view estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can create estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can update estimate line items through estimates" ON public.estimate_line_items;
DROP POLICY IF EXISTS "Users can delete estimate line items through estimates" ON public.estimate_line_items;

CREATE POLICY "Users can view estimate line items through estimates" 
  ON public.estimate_line_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create estimate line items through estimates" 
  ON public.estimate_line_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update estimate line items through estimates" 
  ON public.estimate_line_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete estimate line items through estimates" 
  ON public.estimate_line_items 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates 
      WHERE id = estimate_line_items.estimate_id 
      AND user_id = auth.uid()
    )
  );

-- RLS policies for invoices table
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

CREATE POLICY "Users can view their own invoices" 
  ON public.invoices 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invoices" 
  ON public.invoices 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" 
  ON public.invoices 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" 
  ON public.invoices 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for invoice_line_items table (nested through invoices)
DROP POLICY IF EXISTS "Users can view invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can create invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can update invoice line items through invoices" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Users can delete invoice line items through invoices" ON public.invoice_line_items;

CREATE POLICY "Users can view invoice line items through invoices" 
  ON public.invoice_line_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoice line items through invoices" 
  ON public.invoice_line_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoice line items through invoices" 
  ON public.invoice_line_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoice line items through invoices" 
  ON public.invoice_line_items 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE id = invoice_line_items.invoice_id 
      AND user_id = auth.uid()
    )
  );

-- RLS policies for activity_logs table
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create their own activity logs" ON public.activity_logs;

CREATE POLICY "Users can view their own activity logs" 
  ON public.activity_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs" 
  ON public.activity_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add triggers for auto-calculating line item totals
CREATE OR REPLACE FUNCTION calculate_line_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS estimate_line_item_calculate_total ON public.estimate_line_items;
DROP TRIGGER IF EXISTS invoice_line_item_calculate_total ON public.invoice_line_items;

-- Create triggers for automatic total calculation
CREATE TRIGGER estimate_line_item_calculate_total
  BEFORE INSERT OR UPDATE ON public.estimate_line_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_line_item_total();

CREATE TRIGGER invoice_line_item_calculate_total
  BEFORE INSERT OR UPDATE ON public.invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_line_item_total();
