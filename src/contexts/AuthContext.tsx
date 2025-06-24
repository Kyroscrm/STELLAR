import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AuthUser {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionCache, setPermissionCache] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (session?.user) {
          // Use setTimeout to defer profile loading and avoid recursion
          setTimeout(() => {
            loadUserProfile(session.user);
          }, 0);
        } else {
          setUser(null);
          setPermissionCache({});
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      // Create basic user object first to avoid any RLS issues
      const basicUser: AuthUser = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.email?.split('@')[0] || 'User',
        role: authUser.email === 'nayib@finalroofingcompany.com' ? 'admin' : 'client'
      };

      // Set the basic user immediately
      setUser(basicUser);

      // Try to enhance with profile data, but don't fail if it doesn't work
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*, roles:role_id(id, name)')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!error && profile) {
          setUser({
            id: authUser.id,
            email: profile.email,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
            role: profile.role as 'client' | 'admin' | 'staff' | 'manager',
            roleId: profile.role_id
          });
        }
      } catch (profileError) {
        // Keep the basic user we already set
      }
    } catch (error) {
      // Fallback: create basic user object
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.email?.split('@')[0] || 'User',
        role: authUser.email === 'nayib@finalroofingcompany.com' ? 'admin' : 'client'
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        toast.success('Login successful!');
        return true;
      }

      return false;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'client' | 'admin' = 'client'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: name.split(' ')[0] || '',
            last_name: name.split(' ').slice(1).join(' ') || '',
            role: role
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        toast.success('Registration successful! Please check your email to confirm your account.');
        return true;
      }

      return false;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Clear local state first
      setUser(null);
      setSession(null);
      setPermissionCache({});

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error('Error signing out');
      } else {
        toast.success('Signed out successfully');
      }
    } catch (error) {
      toast.error('Error signing out');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the user has a specific permission
  const checkPermission = async (permission: string): Promise<boolean> => {
    if (!user?.id) return false;

    // Check cache first
    if (permissionCache[permission] !== undefined) {
      return permissionCache[permission];
    }

    try {
      const { data, error } = await supabase.rpc('has_permission', {
        user_id: user.id,
        permission_name: permission
      });

      if (error) return false;

      // Cache the result
      setPermissionCache(prev => ({
        ...prev,
        [permission]: !!data
      }));

      return !!data;
    } catch (error) {
      return false;
    }
  };

  // Alias for checkPermission for readability
  const hasPermission = checkPermission;

  // Check if the user is an admin
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      login,
      logout,
      register,
      isLoading,
      hasPermission,
      checkPermission,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};
