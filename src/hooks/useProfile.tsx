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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data || null);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user || !session) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
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
      const { data, error } = await supabase
        .from('profiles')
        .insert({ ...profileData, id: user.id })
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