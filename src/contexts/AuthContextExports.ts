import { createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin' | 'staff' | 'manager';
  roleId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, role?: 'client' | 'admin') => Promise<boolean>;
  isLoading: boolean;
  hasPermission: (permission: string) => Promise<boolean>;
  checkPermission: (permission: string) => Promise<boolean>;
  isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
