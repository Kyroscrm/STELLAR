import { useAuth } from '@/contexts/AuthContext';

type ResourceAction = 'read' | 'write' | 'delete' | 'admin';
type Resource = 'data_retention' | 'activity_logs' | 'users' | 'settings';

export function hasResourceAction(resource: Resource, action: ResourceAction): boolean {
  // For now, return true as we'll implement proper RBAC checks later
  return true;
}
