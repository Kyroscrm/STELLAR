
import { supabase } from '@/integrations/supabase/client';

export const useActivityLogging = () => {
  const logActivity = async (
    action: string,
    entityType: string,
    entityId: string,
    description?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const { error } = await supabase.rpc('log_activity', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_description: description || null,
        p_metadata: metadata ? JSON.stringify(metadata) : null
      });

      if (error) {
        console.error('Failed to log activity:', error);
      }
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  };

  return { logActivity };
};
