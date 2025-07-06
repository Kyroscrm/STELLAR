-- Drop and recreate the has_permission function
DROP FUNCTION IF EXISTS public.has_permission(uuid, text);

CREATE OR REPLACE FUNCTION public.has_permission(p_user_id uuid, p_required_permission text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_permissions up
        WHERE up.user_id = p_user_id
        AND up.permission_name = p_required_permission
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
