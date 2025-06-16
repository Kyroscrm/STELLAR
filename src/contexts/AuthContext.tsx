import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff' | 'client';
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileFetching, setProfileFetching] = useState(false);

  const fetchUserProfile = async (authUser: User) => {
    if (profileFetching) {
      console.log('Profile fetch already in progress, skipping...');
      return;
    }

    try {
      setProfileFetching(true);
      console.log('Fetching profile for user:', authUser.id);
      
      const { data: fetchedProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, role')
        .eq('id', authUser.id)
        .maybeSingle();

      let profile = fetchedProfile;

      if (!profile && !profileError) {
        console.log('Profile not found, creating new profile...');
        // Profile doesn't exist, create it
        const defaultRole = authUser.email === 'nayib@finalroofingcompany.com' ? 'admin' : 'client';
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            first_name: authUser.user_metadata.first_name ?? '',
            last_name: authUser.user_metadata.last_name ?? '',
            role: defaultRole
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }

        profile = newProfile;
        console.log('Profile created successfully:', profile);
      } else if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (profile) {
        const authUserData = {
          id: authUser.id,
          email: authUser.email || '',
          name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : authUser.email || '',
          role: profile?.role || 'client'
        };
        
        console.log('Setting user data:', authUserData);
        setUser(authUserData);
        return authUserData;
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUser(null);
      throw error;
    } finally {
      setProfileFetching(false);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session ? 'Found' : 'Not found');
        
        if (!mounted) return;
        
        setSession(session);
        if (session?.user && !profileFetching) {
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      if (!mounted) return;
      
      setSession(session);
      
      if (session?.user && event !== 'TOKEN_REFRESHED') {
        try {
          await fetchUserProfile(session.user);
        } catch (error) {
          console.error('Error fetching profile on auth change:', error);
          setUser(null);
        }
      } else if (!session) {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
        return false;
      }

      if (data.user && data.session) {
        console.log('Login successful, user:', data.user.id);
        toast.success('Successfully logged in!');
        return true;
      }

      console.error('Login failed: no user or session returned');
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        // Create profile with proper role type
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            first_name: firstName,
            last_name: lastName,
            role: 'client' as const
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        toast.success('Registration successful! Please check your email to verify your account.');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const logout = signOut;

  const value: AuthContextType = {
    user,
    session,
    login,
    register,
    logout,
    signOut,
    loading,
    isLoading: loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
