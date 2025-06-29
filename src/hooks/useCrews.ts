import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export interface Crew {
  id: string;
  name: string;
  description?: string;
  lead_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CrewMember {
  id: string;
  crew_id: string;
  user_id: string;
  role: 'lead' | 'member' | 'apprentice';
  hourly_rate?: number;
  joined_date?: string;
  left_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type CrewInsert = Omit<Crew, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
type CrewUpdate = Partial<CrewInsert>;
type CrewMemberInsert = Omit<CrewMember, 'id' | 'created_at' | 'updated_at'>;
type CrewMemberUpdate = Partial<CrewMemberInsert>;

export const useCrews = () => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();
  const { executeUpdate } = useOptimisticUpdate();
  const { handleError } = useErrorHandler();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchCrews = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('crews')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCrews(data || []);
    } catch (error: unknown) {
      const crewError = error instanceof Error ? error : new Error('Failed to fetch crews');
      setError(crewError);
      handleError(crewError, { title: 'Failed to fetch crews' });
      setCrews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrewMembers = async (crewId?: string) => {
    if (!validateUserAndSession()) return;

    try {
      let query = supabase
        .from('crew_members')
        .select(`
          *,
          crews!inner(created_by)
        `)
        .eq('crews.created_by', user.id);

      if (crewId) {
        query = query.eq('crew_id', crewId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setCrewMembers(data || []);
    } catch (error: unknown) {
      const memberError = error instanceof Error ? error : new Error('Failed to fetch crew members');
      handleError(memberError, { title: 'Failed to fetch crew members' });
      setCrewMembers([]);
    }
  };

  const createCrew = async (crewData: CrewInsert) => {
    if (!validateUserAndSession()) return null;

    const optimisticCrew: Crew = {
      id: `temp-${Date.now()}`,
      ...crewData,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setCrews(prev => [optimisticCrew, ...prev]),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('crews')
            .insert({ ...crewData, created_by: user.id })
            .select()
            .single();

          if (error) throw error;

          // Replace optimistic with real data
          setCrews(prev => prev.map(c => c.id === optimisticCrew.id ? data : c));
          return data;
        },
        // Rollback
        () => setCrews(prev => prev.filter(c => c.id !== optimisticCrew.id)),
        {
          successMessage: 'Crew created successfully',
          errorMessage: 'Failed to create crew'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const updateCrew = async (id: string, updates: CrewUpdate) => {
    if (!validateUserAndSession()) return false;

    const originalCrew = crews.find(c => c.id === id);
    if (!originalCrew) {
      toast.error('Crew not found');
      return false;
    }

    const optimisticCrew = { ...originalCrew, ...updates, updated_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setCrews(prev => prev.map(c => c.id === id ? optimisticCrew : c)),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('crews')
            .update(updates)
            .eq('id', id)
            .eq('created_by', user.id)
            .select()
            .single();

          if (error) throw error;

          // Update with real data
          setCrews(prev => prev.map(c => c.id === id ? data : c));
          return true;
        },
        // Rollback
        () => setCrews(prev => prev.map(c => c.id === id ? originalCrew : c)),
        {
          successMessage: 'Crew updated successfully',
          errorMessage: 'Failed to update crew'
        }
      );
    } catch (error: unknown) {
      return false;
    }
  };

  const deleteCrew = async (id: string) => {
    if (!validateUserAndSession()) return false;

    const originalCrew = crews.find(c => c.id === id);
    if (!originalCrew) {
      toast.error('Crew not found');
      return false;
    }

    try {
      return await executeUpdate(
        // Optimistic update
        () => setCrews(prev => prev.filter(c => c.id !== id)),
        // Actual update
        async () => {
          const { error } = await supabase
            .from('crews')
            .delete()
            .eq('id', id)
            .eq('created_by', user.id);

          if (error) throw error;
          return true;
        },
        // Rollback
        () => setCrews(prev => [...prev, originalCrew].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )),
        {
          successMessage: 'Crew deleted successfully',
          errorMessage: 'Failed to delete crew'
        }
      );
    } catch (error: unknown) {
      return false;
    }
  };

  const createCrewMember = async (memberData: CrewMemberInsert) => {
    if (!validateUserAndSession()) return null;

    const optimisticMember: CrewMember = {
      id: `temp-${Date.now()}`,
      ...memberData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setCrewMembers(prev => [optimisticMember, ...prev]),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('crew_members')
            .insert(memberData)
            .select()
            .single();

          if (error) throw error;

          // Replace optimistic with real data
          setCrewMembers(prev => prev.map(m => m.id === optimisticMember.id ? data : m));
          return data;
        },
        // Rollback
        () => setCrewMembers(prev => prev.filter(m => m.id !== optimisticMember.id)),
        {
          successMessage: 'Crew member added successfully',
          errorMessage: 'Failed to add crew member'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const updateCrewMember = async (id: string, updates: CrewMemberUpdate) => {
    if (!validateUserAndSession()) return false;

    const originalMember = crewMembers.find(m => m.id === id);
    if (!originalMember) {
      toast.error('Crew member not found');
      return false;
    }

    const optimisticMember = { ...originalMember, ...updates, updated_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setCrewMembers(prev => prev.map(m => m.id === id ? optimisticMember : m)),
        // Actual update
        async () => {
          const { data, error } = await supabase
            .from('crew_members')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          // Update with real data
          setCrewMembers(prev => prev.map(m => m.id === id ? data : m));
          return true;
        },
        // Rollback
        () => setCrewMembers(prev => prev.map(m => m.id === id ? originalMember : m)),
        {
          successMessage: 'Crew member updated successfully',
          errorMessage: 'Failed to update crew member'
        }
      );
    } catch (error: unknown) {
      return false;
    }
  };

  const deleteCrewMember = async (id: string) => {
    if (!validateUserAndSession()) return false;

    const originalMember = crewMembers.find(m => m.id === id);
    if (!originalMember) {
      toast.error('Crew member not found');
      return false;
    }

    try {
      return await executeUpdate(
        // Optimistic update
        () => setCrewMembers(prev => prev.filter(m => m.id !== id)),
        // Actual update
        async () => {
          const { error } = await supabase
            .from('crew_members')
            .delete()
            .eq('id', id);

          if (error) throw error;
          return true;
        },
        // Rollback
        () => setCrewMembers(prev => [...prev, originalMember].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )),
        {
          successMessage: 'Crew member removed successfully',
          errorMessage: 'Failed to remove crew member'
        }
      );
    } catch (error: unknown) {
      return false;
    }
  };

  useEffect(() => {
    fetchCrews();
  }, [user, session]);

  return {
    crews,
    crewMembers,
    loading,
    error,
    fetchCrews,
    fetchCrewMembers,
    createCrew,
    updateCrew,
    deleteCrew,
    createCrewMember,
    updateCrewMember,
    deleteCrewMember
  };
};
