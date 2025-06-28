-- Debug permissions for the logged-in user

-- 1. Check the user's profile and role
SELECT
  p.id as profile_id,
  p.role_id,
  r.name as role_name,
  r.description as role_description
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.id = '26dfd813-d079-4703-b883-5ea6efd99c4f';

-- 2. Check all permissions assigned to the user's role
SELECT
  rp.role_id,
  r.name as role_name,
  rp.permission_id,
  perm.name as permission_name,
  perm.description as permission_description
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions perm ON rp.permission_id = perm.id
WHERE rp.role_id = (
  SELECT role_id
  FROM profiles
  WHERE id = '26dfd813-d079-4703-b883-5ea6efd99c4f'
)
ORDER BY perm.name;

-- 3. Count total permissions for the user
SELECT
  COUNT(*) as total_permissions
FROM role_permissions rp
WHERE rp.role_id = (
  SELECT role_id
  FROM profiles
  WHERE id = '26dfd813-d079-4703-b883-5ea6efd99c4f'
);

-- 4. Check for leads:read permission specifically
SELECT
  p.id as profile_id,
  perm.name as permission_name
FROM profiles p
JOIN role_permissions rp ON p.role_id = rp.role_id
JOIN permissions perm ON rp.permission_id = perm.id
WHERE p.id = '26dfd813-d079-4703-b883-5ea6efd99c4f'
  AND perm.name = 'leads:read';

-- 5. Check all available permissions in the system
SELECT name, description FROM permissions ORDER BY name;
