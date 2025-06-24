import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/types/app-types';

export type Profile = Tables<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;
export type Role = Tables<'roles'>;

// Define a type for the profile with role join
export type ProfileWithRole = Profile & {
  roles: Pick<Role, 'id' | 'name' | 'description'>;
};

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<Profile | null>;
  createProfile: (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => Promise<Profile | null>;
  roles: Role[];
  loadingRoles: boolean;
  fetchRoles: () => Promise<Role[]>;
  getUserRole: (userId?: string) => Promise<ProfileWithRole | null>;
  updateUserRole: (userId: string, roleId: string) => Promise<Profile | null>;
  checkPermission: (permissionName: string) => Promise<boolean>;
}

const isSupabaseError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'error' in error && typeof (error as ApiError).error === 'object';
};

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const { user, session } = useAuth();

  const validateUserAndSession = (): boolean => {
    if (!user || !session) {
      // Profile operations require authentication - don't show error to user
      return false;
    }
    return true;
  };

  const fetchProfile = async (): Promise<void> => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    try {
      // Use a more direct query to avoid RLS recursion
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        // Profile fetch error is expected in some cases - don't show to user
        setProfile(null);
      } else {
        setProfile(data || null);
      }
    } catch (error: unknown) {
      // Profile fetch error is expected in some cases - don't show to user
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdate): Promise<Profile | null> => {
    if (!validateUserAndSession()) return null;

    try {
      // Ensure we have the required email field for upsert
      const profileData = {
        id: user.id,
        email: user.email, // Use email from auth user
        ...updates
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success('Profile updated successfully');
      return data;
    } catch (error: unknown) {
      if (isSupabaseError(error)) {
        const errorMessage = error.error.message || 'Failed to update profile';
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update profile');
      }
      return null;
    }
  };

  const createProfile = async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile | null> => {
    if (!validateUserAndSession()) return null;

    try {
      // Ensure we have all required fields for insert
      const completeProfileData = {
        id: user.id,
        email: user.email, // Use email from auth user
        ...profileData
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(completeProfileData)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success('Profile created successfully');
      return data;
    } catch (error: unknown) {
      if (isSupabaseError(error)) {
        const errorMessage = error.error.message || 'Failed to create profile';
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create profile');
      }
      return null;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  // Fetch all available roles
  const fetchRoles = async (): Promise<Role[]> => {
    setLoadingRoles(true);
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data);
      return data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
      return [];
    } finally {
      setLoadingRoles(false);
    }
  };

  // Get user's current role
  const getUserRole = async (userId: string = user?.id || ''): Promise<ProfileWithRole | null> => {
    if (!userId) {
      toast.error('User ID is required to get role');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, roles:role_id(*)')
        .eq('id', userId)
        .single();

      if (error) {
        toast.error('Failed to load user role');
        return null;
      }

      return data as ProfileWithRole;
    } catch (error) {
      toast.error('Failed to load user role');
      return null;
    }
  };

  // Update user's role
  const updateUserRole = async (userId: string, roleId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role_id: roleId })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      toast.success('User role updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return null;
    }
  };

  // Check if user has a specific permission
  const checkPermission = async (permissionName: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase.rpc('has_permission', {
        user_id: user.id,
        permission_name: permissionName
      });

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    createProfile,
    roles,
    loadingRoles,
    fetchRoles,
    getUserRole,
    updateUserRole,
    checkPermission
  };
};
