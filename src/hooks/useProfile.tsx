
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Profile = Tables<'profiles'>;
type ProfileUpdate = TablesUpdate<'profiles'>;

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();

  const fetchProfile = async () => {
    if (!user || !session) return;
    
    setLoading(true);
    try {
      // Use a more direct query to avoid RLS recursion
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.log('Profile fetch error (this might be expected):', error);
        // Don't throw error, just set profile to null
        setProfile(null);
      } else {
        setProfile(data || null);
      }
    } catch (error: any) {
      console.log('Profile fetch error:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user || !session) return null;

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
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return null;
    }
  };

  const createProfile = async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !session) return null;

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
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
      return null;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, session]);

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    createProfile
  };
};
