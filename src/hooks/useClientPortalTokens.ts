
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useClientPortalTokens = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateToken = async (customerId: string, expiresHours: number = 168): Promise<string | null> => {
    if (!user) {
      toast.error('Authentication required');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('generate_client_portal_token', {
          p_customer_id: customerId,
          p_user_id: user.id,
          p_expires_hours: expiresHours
        });

      if (error) throw error;

      toast.success('Client portal token generated successfully');
      return data;
    } catch (error: any) {
      console.error('Error generating token:', error);
      toast.error('Failed to generate client portal token');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateMagicLink = async (customerId: string, baseUrl?: string): Promise<string | null> => {
    const token = await generateToken(customerId);
    if (!token) return null;

    const url = baseUrl || window.location.origin;
    return `${url}/client/login?token=${token}`;
  };

  const sendMagicLink = async (customerId: string, customerEmail: string): Promise<boolean> => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    try {
      const magicLink = await generateMagicLink(customerId);
      if (!magicLink) return false;

      // In a real implementation, this would call an edge function to send the email
      // For now, we'll just copy to clipboard and show a message
      await navigator.clipboard.writeText(magicLink);
      
      toast.success(`Magic link copied to clipboard! Send this to ${customerEmail}`, {
        duration: 10000,
        description: magicLink
      });
      
      return true;
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      toast.error('Failed to send magic link');
      return false;
    }
  };

  return {
    generateToken,
    generateMagicLink,
    sendMagicLink,
    loading
  };
};
