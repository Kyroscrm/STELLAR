
-- Check if 'approved' status exists in job_status enum and add it if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'approved' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'job_status')
    ) THEN
        ALTER TYPE job_status ADD VALUE 'approved';
    END IF;
END$$;
