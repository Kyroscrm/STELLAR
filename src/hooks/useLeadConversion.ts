
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Customer } from '@/hooks/useCustomers';

export const useLeadConversion = () => {
  const { user } = useAuth();
  const [isConverting, setIsConverting] = useState(false);

  const convertLeadToCustomer = async (leadId: string): Promise<Customer | null> => {
    if (!user) return null;

    setIsConverting(true);
    try {
      // Get the lead data
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .eq('user_id', user.id)
        .single();

      if (leadError) throw leadError;

      // Create customer from lead
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          lead_id: leadId,
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
          city: lead.city,
          state: lead.state,
          zip_code: lead.zip_code,
          notes: lead.notes
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Update lead status to 'won'
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: 'won' })
        .eq('id', leadId);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'lead',
        entity_id: leadId,
        action: 'converted',
        description: `Lead converted to customer: ${lead.first_name} ${lead.last_name}`
      });

      toast.success('Lead successfully converted to customer');
      return customer;

    } catch (error: any) {
      console.error('Error converting lead:', error);
      toast.error('Failed to convert lead to customer');
      return null;
    } finally {
      setIsConverting(false);
    }
  };

  return {
    convertLeadToCustomer,
    isConverting
  };
};
