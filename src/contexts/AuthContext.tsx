
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff' | 'client' | 'user';
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

  useEffect(() => {
    console.log('Auth Session:', session);
    console.log('Current User:', user);
  }, [session, user]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('Getting initial session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        console.log('Initial session:', session);
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log('Fetching profile for user:', authUser.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, role')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one with default values
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile...');
          
          // Determine if this is the admin user
          const isAdminUser = authUser.email === 'nayib@finalroofingcompany.com';
          const defaultRole = isAdminUser ? 'admin' : 'client';
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              email: authUser.email || '',
              first_name: authUser.user_metadata?.first_name || '',
              last_name: authUser.user_metadata?.last_name || '',
              role: defaultRole
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          } else {
            console.log('Profile created successfully:', newProfile);
            // Use the newly created profile
            profile = newProfile;
          }
        } else {
          return;
        }
      }

      if (profile) {
        const authUserData = {
          id: authUser.id,
          email: authUser.email || '',
          name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : authUser.email || '',
          role: (profile?.role as 'admin' | 'manager' | 'staff' | 'client' | 'user') || 'client'
        };

        console.log('Setting user data:', authUserData);
        setUser(authUserData);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Starting login process for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
        setLoading(false);
        return false;
      }

      if (data.user && data.session) {
        console.log('Login successful, user:', data.user);
        console.log('Login successful, session:', data.session);
        setSession(data.session);
        await fetchUserProfile(data.user);
        toast.success('Successfully logged in!');
        setLoading(false);
        return true;
      }

      setLoading(false);
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
      setLoading(false);
      return false;
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
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email ?? '',
            first_name: firstName,
            last_name: lastName,
            role: 'client'
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

  const logout = signOut; // Alias for compatibility

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
