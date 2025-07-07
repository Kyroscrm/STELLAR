ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
UPDATE public.time_entries SET status = CASE WHEN end_time IS NULL THEN 'active' ELSE 'completed' END WHERE status IS NULL;
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) DEFAULT 0.00;
UPDATE public.change_orders SET amount = 0.00 WHERE amount IS NULL;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS estimate_number VARCHAR(50);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS created_by UUID;
WITH numbered_estimates AS (
    SELECT
        id,
        'EST-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0') AS new_estimate_number
    FROM
        public.estimates
    WHERE
        estimate_number IS NULL
)
UPDATE public.estimates
SET
    estimate_number = ne.new_estimate_number
FROM
    numbered_estimates ne
WHERE
    estimates.id = ne.id;
UPDATE public.invoices SET title = 'Invoice ' || COALESCE(invoice_number, 'New') WHERE title IS NULL;
UPDATE public.tasks SET created_by = '28dc0c62-8e09-44e3-9497-5f62c6a0b436' WHERE created_by IS NULL;