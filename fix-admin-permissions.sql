-- First drop the existing has_permission function to avoid the error
DROP FUNCTION IF EXISTS public.has_permission(uuid, text);

-- Now run the complete admin setup
\i 'complete-admin-setup.sql'

-- Then rebuild all RLS policies
\i 'rebuild-rls-policies.sql'

-- Finally verify permissions
\i 'verify-permissions.sql'

-- Additional verification query
SELECT
    u.email,
    p.permission_name,
    p.granted_at
FROM auth.users u
JOIN public.user_permissions p ON u.id = p.user_id
WHERE u.email = 'nayib@finalroofingcompany.com'
ORDER BY p.permission_name;

