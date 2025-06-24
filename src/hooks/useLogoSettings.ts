import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface LogoSettings {
  id: string;
  user_id: string;
  logo_url: string | null;
  logo_position: 'top-center' | 'watermark' | 'both';
  logo_width: number;
  logo_height: number;
  watermark_opacity: number;
  show_on_drafts: boolean;
  show_on_approved: boolean;
  created_at: string;
  updated_at: string;
}

// Type-safe logo position validator
const safeLogoPosition = (pos: string): "top-center" | "watermark" | "both" => {
  return ["top-center", "watermark", "both"].includes(pos) ? (pos as "top-center" | "watermark" | "both") : "top-center";
};

export const useLogoSettings = () => {
  const { user, session } = useAuth();
  const [settings, setSettings] = useState<LogoSettings | null>(null);
  const [loading, setLoading] = useState(false);

  const validateUserAndSession = () => {
    if (!user || !session) {
      toast.error('Authentication required. Please log in again.');
      return false;
    }
    return true;
  };

  const fetchSettings = async () => {
    if (!validateUserAndSession()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('logo_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          ...data,
          logo_position: safeLogoPosition(data.logo_position)
        });
      } else {
        await createDefaultSettings();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to fetch logo settings');
      } else {
        toast.error('Failed to fetch logo settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    if (!validateUserAndSession()) return;

    try {
      const { data, error } = await supabase
        .from('logo_settings')
        .insert({
          user_id: user.id,
          logo_position: 'top-center',
          logo_width: 120,
          logo_height: 60,
          watermark_opacity: 0.07,
          show_on_drafts: true,
          show_on_approved: true
        })
        .select()
        .single();

      if (error) throw error;

      setSettings({
        ...data,
        logo_position: safeLogoPosition(data.logo_position)
      });
      return data;
    } catch (error: unknown) {
      return null;
    }
  };

  const updateSettings = async (updates: Partial<Omit<LogoSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!validateUserAndSession() || !settings) return false;

    // Optimistic update
    const optimisticSettings = { ...settings, ...updates, updated_at: new Date().toISOString() };
    setSettings(optimisticSettings);

    try {
      const { data, error } = await supabase
        .from('logo_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update with real data
      setSettings({
        ...data,
        logo_position: safeLogoPosition(data.logo_position)
      });

      return true;
    } catch (error: unknown) {
      // Rollback optimistic update
      setSettings(settings);
      toast.error('Failed to update logo settings');
      return false;
    }
  };

  const uploadLogo = async (file: File) => {
    if (!validateUserAndSession()) return null;

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      const logoUrl = urlData.publicUrl;

      // Update settings with new logo URL
      await updateSettings({ logo_url: logoUrl });

      toast.success('Logo uploaded successfully');
      return logoUrl;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Failed to upload logo');
      } else {
        toast.error('Failed to upload logo');
      }
      return null;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user, session]);

  return {
    settings,
    loading,
    updateSettings,
    uploadLogo,
    fetchSettings
  };
};
