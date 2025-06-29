"import { useAuth } from '@/contexts/AuthContext';"

import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export interface Material {
  id: string;
  user_id: string;
  name: string;
  sku?: string;
  category?: string;
  brand?: string;
  description?: string;
  unit_of_measure: string;
  cost_per_unit?: number;
  selling_price_per_unit?: number;
  current_stock: number;
  min_stock_level: number;
  supplier_name?: string;
  supplier_contact?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobMaterial {
  id: string;
  job_id: string;
  material_id: string;
  quantity_estimated: number;
  quantity_used: number;
  unit_cost?: number;
  total_cost?: number;
  date_used?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  material?: Material;
}

type MaterialInsert = Omit<Material, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
type MaterialUpdate = Partial<MaterialInsert>;
type JobMaterialInsert = Omit<JobMaterial, 'id' | 'created_at' | 'updated_at' | 'material'>;
type JobMaterialUpdate = Partial<JobMaterialInsert>;

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [jobMaterials, setJobMaterials] = useState<JobMaterial[]>([]);
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

  const fetchMaterials = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error: unknown) {
      const materialError = error instanceof Error ? error : new Error('Failed to fetch materials');
      setError(materialError);
      handleError(materialError, { title: 'Failed to fetch materials' });
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const createMaterial = async (materialData: MaterialInsert) => {
    if (!validateUserAndSession()) return null;

    const optimisticMaterial: Material = {
      id: `temp-${Date.now()}`,
      ...materialData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      return await executeUpdate(
        () => setMaterials(prev => [optimisticMaterial, ...prev]),
        async () => {
          const { data, error } = await supabase
            .from('materials')
            .insert({ ...materialData, user_id: user.id })
            .select()
            .single();

          if (error) throw error;
          setMaterials(prev => prev.map(m => m.id === optimisticMaterial.id ? data : m));
          return data;
        },
        () => setMaterials(prev => prev.filter(m => m.id !== optimisticMaterial.id)),
        {
          successMessage: 'Material created successfully',
          errorMessage: 'Failed to create material'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const updateMaterial = async (id: string, updates: MaterialUpdate) => {
    if (!validateUserAndSession()) return false;

    const originalMaterial = materials.find(m => m.id === id);
    if (!originalMaterial) {
      toast.error('Material not found');
      return false;
    }

    const optimisticMaterial = { ...originalMaterial, ...updates, updated_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        () => setMaterials(prev => prev.map(m => m.id === id ? optimisticMaterial : m)),
        async () => {
          const { data, error } = await supabase
            .from('materials')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) throw error;
          setMaterials(prev => prev.map(m => m.id === id ? data : m));
          return true;
        },
        () => setMaterials(prev => prev.map(m => m.id === id ? originalMaterial : m)),
        {
          successMessage: 'Material updated successfully',
          errorMessage: 'Failed to update material'
        }
      );
    } catch (error: unknown) {
      return false;
    }
  };

  const getLowStockMaterials = () => {
    return materials.filter(material =>
      material.is_active &&
      material.current_stock <= material.min_stock_level
    );
  };

  const getStockValue = () => {
    return materials.reduce((total, material) => {
      const unitCost = material.cost_per_unit || 0;
      return total + (material.current_stock * unitCost);
    }, 0);
  };

  useEffect(() => {
    fetchMaterials();
  }, [user, session]);

  return {
    materials,
    jobMaterials,
    loading,
    error,
    fetchMaterials,
    createMaterial,
    updateMaterial,
    getLowStockMaterials,
    getStockValue
  };
};
