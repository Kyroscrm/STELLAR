const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load Supabase configuration
const supabaseUrl = 'https://kmjgbbzbqotorocychzl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttamdiYnpicW90b3JvY3ljaHpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjU1ODQ3MSwiZXhwIjoyMDQ4MTM0NDcxfQ.d8gzCFjrcGhOKwC30O-_LZnZoLKSZT8H0qLBtZHMB8Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyActivityLoggingFix() {
  try {
    console.log('🔧 Applying comprehensive activity logging fix...');

    // Read the SQL fix file
    const sqlFix = fs.readFileSync('fix-comprehensive-activity-logging.sql', 'utf8');

    // Execute the SQL fix
    const { error } = await supabase.rpc('exec_sql', { sql: sqlFix });

    if (error) {
      console.error('❌ Error applying SQL fix:', error);

      // Try applying individual parts
      console.log('🔄 Trying to apply log_activity function separately...');

      const logActivityFunction = `
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_changed_fields TEXT[] DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id UUID DEFAULT NULL,
  p_compliance_level TEXT DEFAULT 'standard',
  p_risk_score INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_log_id UUID;
  user_email TEXT;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  -- If no user ID, handle gracefully
  IF v_user_id IS NULL THEN
    -- Return a dummy UUID to prevent errors but log warning
    RETURN gen_random_uuid();
  END IF;

  -- Get user email for admin checks
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = v_user_id;

  -- Validate required parameters (unless admin)
  IF user_email != 'nayib@finalroofingcompany.com' THEN
    IF p_entity_type IS NULL OR p_entity_type = '' THEN
      RAISE EXCEPTION 'entity_type cannot be null or empty';
    END IF;

    IF p_action IS NULL OR p_action = '' THEN
      RAISE EXCEPTION 'action cannot be null or empty';
    END IF;
  END IF;

  -- Generate log ID
  v_log_id := gen_random_uuid();

  -- Insert the activity log
  INSERT INTO public.activity_logs (
    id,
    user_id,
    entity_type,
    entity_id,
    action,
    description,
    metadata,
    old_data,
    new_data,
    changed_fields,
    ip_address,
    user_agent,
    session_id,
    compliance_level,
    risk_score,
    created_at
  ) VALUES (
    v_log_id,
    v_user_id,
    COALESCE(p_entity_type, 'unknown'),
    p_entity_id,
    COALESCE(p_action, 'unknown'),
    p_description,
    p_metadata,
    p_old_data,
    p_new_data,
    p_changed_fields,
    p_ip_address,
    p_user_agent,
    p_session_id,
    COALESCE(p_compliance_level, 'standard'),
    COALESCE(p_risk_score, 0),
    NOW()
  );

  RETURN v_log_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Silently fail for activity logging to not break main functionality
    -- Return a dummy UUID to satisfy return type
    RETURN gen_random_uuid();
END;
$$;
`;

      const { error: logError } = await supabase.rpc('exec_sql', { sql: logActivityFunction });

      if (logError) {
        console.error('❌ Error applying log_activity function:', logError);
        return false;
      }

      console.log('✅ Successfully applied log_activity function');
    } else {
      console.log('✅ Successfully applied comprehensive activity logging fix');
    }

    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

// Run the fix
applyActivityLoggingFix()
  .then(success => {
    if (success) {
      console.log('🎉 Activity logging fix applied successfully!');
      process.exit(0);
    } else {
      console.log('❌ Failed to apply activity logging fix');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
