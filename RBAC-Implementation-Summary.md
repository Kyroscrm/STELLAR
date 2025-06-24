# RBAC Implementation Summary

## Overview

This document summarizes the implementation of a comprehensive Role-Based Access Control (RBAC) system for the STELLAR CRM application. The RBAC system provides fine-grained permission control based on user roles.

## Database Schema Changes

1. **New Tables**:
   - `roles`: Stores role definitions (admin, sales_rep, project_manager, accountant, client)
   - `permissions`: Stores individual permissions (e.g., leads:read, customers:create)
   - `role_permissions`: Junction table linking roles to their permissions

2. **Updated Tables**:
   - `profiles`: Added `role_id` column referencing the `roles` table

## SQL Functions

1. **has_permission**: Checks if a user has a specific permission
   ```sql
   SELECT has_permission(user_id, 'leads:read')
   ```

2. **get_current_user_role**: Returns the current user's role name
   ```sql
   SELECT get_current_user_role()
   ```

3. **is_admin**: Checks if a user is an admin
   ```sql
   SELECT is_admin(user_id)
   ```

4. **migrate_profile_roles**: One-time migration function to convert old role enum values to the new role_id references

5. **sync_profile_role_fields**: Trigger function to keep the old role enum field in sync with the new role_id for backward compatibility

## RLS Policies

All Row Level Security (RLS) policies have been updated to use the `has_permission` function:

```sql
CREATE POLICY "Allow select for leads" ON public.leads
  FOR SELECT USING (has_permission(auth.uid(), 'leads:read'));
```

## TypeScript Integration

1. **Updated Types**:
   - Added types for roles, permissions, and role_permissions tables
   - Updated profile type to include role_id

2. **Security Utilities**:
   - Enhanced `validatePermission` function to use the new has_permission RPC
   - Updated `enforcePolicy` function to leverage the new permission system

3. **Auth Context**:
   - Added `checkPermission` and `hasPermission` functions
   - Added `isAdmin` helper function
   - Added permission caching for better performance

4. **Profile Hook**:
   - Added `fetchRoles`, `getUserRole`, `updateUserRole`, and `checkPermission` functions
   - Added types for role-related operations

5. **Protected Route Component**:
   - Updated to support both role-based and permission-based access control
   - Added async permission checking with loading state

## Default Roles and Permissions

1. **Roles**:
   - `admin`: Full system access
   - `sales_rep`: Access to leads, customers, and estimates
   - `project_manager`: Access to jobs and tasks
   - `accountant`: Access to invoices and financial data
   - `client`: Limited access to their own data

2. **Permission Categories**:
   - Entity-specific permissions (e.g., leads:read, customers:update)
   - System-wide permissions (e.g., users:create, activity_logs:read)

## Migration Path

1. Existing profiles are automatically migrated to the new system
2. The old `role` enum field is maintained and kept in sync for backward compatibility
3. New users are assigned the 'client' role by default

## Testing

Unit tests have been added for:
- Permission validation
- Policy enforcement
- Role assignment and checking

## Usage Examples

### In React Components:

```tsx
// Using the Auth Context
const { hasPermission } = useAuth();

// Check permission before rendering a button
{(await hasPermission('leads:delete')) && (
  <button onClick={handleDelete}>Delete Lead</button>
)}

// Protected routes
<ProtectedRoute requiredPermission="customers:read">
  <CustomersPage />
</ProtectedRoute>
```

### In Data Hooks:

```tsx
// Using enforcePolicy in a data hook
const deleteCustomer = async (id: string) => {
  return enforcePolicy('customers:delete', async () => {
    const { data, error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  });
};
```
