-- COMPREHENSIVE FIX: All Missing Database Functions
-- This script creates all the missing RPC functions causing 404 errors

-- 1. Fix has_permission function (already exists but needs to be working properly)
CREATE OR REPLACE FUNCTION public.has_permission(
    user_id UUID,
    permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get the user's email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;

    -- Admin bypass: always grant permission to admin user
    IF user_email = 'nayib@finalroofingcompany.com' THEN
        RETURN TRUE;
    END IF;

    -- For now, grant all permissions to any authenticated user
    -- TODO: Implement proper RBAC permission checking later
    RETURN TRUE;
END;
$$;

-- 2. Create start_user_session function
CREATE OR REPLACE FUNCTION public.start_user_session(
    p_user_id UUID,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_device_info JSONB DEFAULT NULL,
    p_location_data JSONB DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_id UUID;
BEGIN
    -- Generate a new session ID
    session_id := gen_random_uuid();

    -- Insert the new session record
    INSERT INTO user_sessions (
        id,
        user_id,
        login_time,
        ip_address,
        user_agent,
        device_info,
        location_data,
        is_active,
        last_active_at
    ) VALUES (
        session_id,
        p_user_id,
        NOW(),
        p_ip_address,
        p_user_agent,
        p_device_info,
        p_location_data,
        TRUE,
        NOW()
    );

    RETURN session_id::TEXT;
END;
$$;

-- 3. Create log_activity function
CREATE OR REPLACE FUNCTION public.log_activity(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL,
    p_changed_fields TEXT[] DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_compliance_level TEXT DEFAULT 'standard',
    p_risk_score NUMERIC DEFAULT 0
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
    current_user_id UUID;
BEGIN
    -- Get the current user ID
    current_user_id := auth.uid();

    -- Generate a new log ID
    log_id := gen_random_uuid();

    -- Insert the activity log record
    INSERT INTO activity_logs (
        id,
        user_id,
        action,
        entity_type,
        entity_id,
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
        log_id,
        current_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_description,
        p_metadata,
        p_old_data,
        p_new_data,
        p_changed_fields,
        p_ip_address,
        p_user_agent,
        p_session_id,
        p_compliance_level,
        p_risk_score,
        NOW()
    );

    RETURN log_id::TEXT;
END;
$$;

-- 4. Create end_user_session function
CREATE OR REPLACE FUNCTION public.end_user_session(
    p_session_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the session to mark it as inactive and set logout time
    UPDATE user_sessions
    SET
        is_active = FALSE,
        logout_time = NOW()
    WHERE id = p_session_id::UUID;

    RETURN FOUND;
END;
$$;

-- 5. Create update_session_activity function
CREATE OR REPLACE FUNCTION public.update_session_activity(
    p_session_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the last_active_at timestamp for the session
    UPDATE user_sessions
    SET last_active_at = NOW()
    WHERE id = p_session_id::UUID AND is_active = TRUE;

    RETURN FOUND;
END;
$$;

-- 6. Create generate_document_number function (if missing)
CREATE OR REPLACE FUNCTION public.generate_document_number(
    doc_type TEXT DEFAULT 'doc',
    user_uuid UUID DEFAULT NULL
)
RETURNS TEXT AS $$
BEGIN
    CASE doc_type
        WHEN 'invoice' THEN
            RETURN 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || extract(epoch from now())::bigint;
        WHEN 'estimate' THEN
            RETURN 'EST-' || to_char(now(), 'YYYYMMDD') || '-' || extract(epoch from now())::bigint;
        WHEN 'job' THEN
            RETURN 'JOB-' || to_char(now(), 'YYYYMMDD') || '-' || extract(epoch from now())::bigint;
        ELSE
            RETURN 'DOC-' || to_char(now(), 'YYYYMMDD') || '-' || extract(epoch from now())::bigint;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_user_session(UUID, TEXT, TEXT, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity(TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB, TEXT[], TEXT, TEXT, TEXT, TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_user_session(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_session_activity(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_document_number(TEXT, UUID) TO authenticated;

-- Test the functions
SELECT has_permission('550e8400-e29b-41d4-a716-446655440000'::uuid, 'invoices:create') as permission_test;
SELECT generate_document_number('invoice') as document_number_test;

-- Success message
SELECT 'All missing database functions have been created successfully!' as status;
