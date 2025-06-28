import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';

interface Role {
  id: string;
  name: string;
  description: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface UserPermissions {
  role: Role | null;
  permissions: Permission[];
  hasPermission: (permission: string) => boolean;
  hasResourceAction: (resource: string, action: string) => boolean;
}

// Fallback admin permissions for troubleshooting
const ADMIN_PERMISSIONS = [
  'leads:read', 'leads:write', 'leads:delete',
  'customers:read', 'customers:write', 'customers:delete',
  'jobs:read', 'jobs:write', 'jobs:delete',
  'tasks:read', 'tasks:write', 'tasks:delete',
  'estimates:read', 'estimates:write', 'estimates:delete',
  'invoices:read', 'invoices:write', 'invoices:delete',
  'admin:users', 'admin:settings', 'admin:billing'
];

const ADMIN_ROLE: Role = {
  id: 'admin',
  name: 'admin',
  description: 'Administrator'
};

export const useRBAC = (): UserPermissions & { loading: boolean; error: Error | null } => {
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const fetchUserPermissions = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Get user's role_id from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // Fallback for admin user if profile query fails
                 if (user.email === 'nayib@finalroofingcompany.com') {
           setRole(ADMIN_ROLE);
          setPermissions(ADMIN_PERMISSIONS.map(name => ({ id: name, name, description: `Admin permission for ${name}` })));
          return;
        }
        throw profileError;
      }

      if (!profileData?.role_id) {
        // Fallback for admin user if no role assigned
                 if (user.email === 'nayib@finalroofingcompany.com') {
           setRole(ADMIN_ROLE);
          setPermissions(ADMIN_PERMISSIONS.map(name => ({ id: name, name, description: `Admin permission for ${name}` })));
          return;
        }
        setRole(null);
        setPermissions([]);
        return;
      }

      // Step 2: Get role details
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id, name, description')
        .eq('id', profileData.role_id)
        .single();

      if (roleError) throw roleError;

      setRole(roleData);

      // Step 3: Get permissions for this role
      const { data: rolePermissions, error: permissionsError } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', profileData.role_id);

      if (permissionsError) throw permissionsError;

      if (!rolePermissions || rolePermissions.length === 0) {
        setPermissions([]);
        return;
      }

      // Step 4: Get permission details
      const permissionIds = rolePermissions.map(rp => rp.permission_id);
      const { data: permissionData, error: permissionDetailsError } = await supabase
        .from('permissions')
        .select('id, name, description')
        .in('id', permissionIds);

      if (permissionDetailsError) throw permissionDetailsError;

      setPermissions(permissionData || []);

    } catch (error: unknown) {
      const rbacError = error instanceof Error ? error : new Error('Failed to fetch user permissions');

      // Fallback for admin user if any error occurs
             if (user.email === 'nayib@finalroofingcompany.com') {
         setRole(ADMIN_ROLE);
        setPermissions(ADMIN_PERMISSIONS.map(name => ({ id: name, name, description: `Admin permission for ${name}` })));
        setError(null); // Clear error when using fallback
        return;
      }

      setError(rbacError);
      handleError(rbacError, { title: 'Failed to load user permissions' });
      setPermissions([]);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    // Admin bypass: nayib@finalroofingcompany.com has all permissions
    if (user?.email === 'nayib@finalroofingcompany.com') {
      return true;
    }
    return permissions.some(p => p.name === permission);
  };

  const hasResourceAction = (resource: string, action: string): boolean => {
    // Admin bypass: nayib@finalroofingcompany.com has all permissions
    if (user?.email === 'nayib@finalroofingcompany.com') {
      return true;
    }
    // Parse permission name like "leads:read" into resource and action
    const permissionName = `${resource}:${action}`;
    return permissions.some(p => p.name === permissionName);
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [user?.id]);

  return {
    role,
    permissions,
    hasPermission,
    hasResourceAction,
    loading,
    error
  };
};

// Hook for managing roles (admin only)
export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const { hasPermission } = useRBAC();

  const fetchRoles = async () => {
    if (!user?.id || !hasPermission('admin:users')) {
      setError(new Error('Insufficient permissions'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;

      setRoles(data || []);
    } catch (error: unknown) {
      const roleError = error instanceof Error ? error : new Error('Failed to fetch roles');
      setError(roleError);
      handleError(roleError, { title: 'Failed to fetch roles' });
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, roleId: string) => {
    if (!hasPermission('admin:users')) {
      toast.error('Insufficient permissions to assign roles');
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_id: roleId })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Role assigned successfully');
      return true;
    } catch (error: unknown) {
      const assignError = error instanceof Error ? error : new Error('Failed to assign role');
      handleError(assignError, { title: 'Failed to assign role' });
      return false;
    }
  };

  useEffect(() => {
    if (hasPermission('admin:users')) {
      fetchRoles();
    }
  }, [user?.id, hasPermission('admin:users')]);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    assignRole
  };
};

// Enhanced permission checker component
export const usePermissionGuard = () => {
  const { hasPermission, hasResourceAction } = useRBAC();
  const { user } = useAuth();

  const checkPermission = (permission: string): boolean => {
    // Admin bypass: nayib@finalroofingcompany.com has all permissions
    if (user?.email === 'nayib@finalroofingcompany.com') {
      return true;
    }
    return hasPermission(permission);
  };

  const checkResourceAccess = (resource: string, action: string): boolean => {
    // Admin bypass: nayib@finalroofingcompany.com has all permissions
    if (user?.email === 'nayib@finalroofingcompany.com') {
      return true;
    }
    return hasResourceAction(resource, action);
  };

  const requirePermission = (permission: string): void => {
    // Admin bypass: nayib@finalroofingcompany.com has all permissions
    if (user?.email === 'nayib@finalroofingcompany.com') {
      return;
    }
    if (!hasPermission(permission)) {
      throw new Error(`Permission required: ${permission}`);
    }
  };

  return {
    checkPermission,
    checkResourceAccess,
    requirePermission
  };
};
