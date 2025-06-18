
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useLeadConversion = () => {
  const [isConverting, setIsConverting] = useState(false);
  const { user } = useAuth();

  const convertLeadToCustomer = async (
    leadId: string, 
    options?: { notes?: string; conversion_reason?: string }
  ) => {
    if (!user) {
      toast.error('You must be logged in to convert leads');
      return null;
    }

    setIsConverting(true);
    try {
      console.log('Converting lead to customer:', leadId);

      // First, get the lead data
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .eq('user_id', user.id)
        .single();

      if (leadError) {
        console.error('Error fetching lead:', leadError);
        throw leadError;
      }

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Create customer from lead data
      const customerData = {
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        city: lead.city,
        state: lead.state,
        zip_code: lead.zip_code,
        notes: options?.notes || `Converted from lead. ${options?.conversion_reason || ''}`.trim(),
        user_id: user.id,
        lead_id: leadId
      };

      // Insert new customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (customerError) {
        console.error('Error creating customer:', customerError);
        throw customerError;
      }

      // Update lead status to converted (now supported in enum)
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: 'converted' })
        .eq('id', leadId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating lead status:', updateError);
        throw updateError;
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'lead',
        entity_id: leadId,
        action: 'converted',
        description: `Lead converted to customer: ${customer.first_name} ${customer.last_name}`
      });

      console.log('Lead converted successfully:', customer);
      toast.success('Lead converted to customer successfully!');
      
      return customer;
    } catch (error: any) {
      console.error('Error converting lead:', error);
      toast.error(error.message || 'Failed to convert lead to customer');
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
