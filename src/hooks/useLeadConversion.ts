
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Customer } from '@/hooks/useCustomers';

interface ConversionMetadata {
  notes?: string;
  conversion_reason?: string;
}

export const useLeadConversion = () => {
  const { user } = useAuth();
  const [isConverting, setIsConverting] = useState(false);

  const convertLeadToCustomer = async (
    leadId: string, 
    metadata?: ConversionMetadata
  ): Promise<Customer | null> => {
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
      const customerData = {
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
        notes: metadata?.notes ? 
          `${lead.notes ? lead.notes + '\n\n' : ''}Conversion Notes: ${metadata.notes}` : 
          lead.notes
      };

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (customerError) throw customerError;

      // Update lead status to 'won'
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          status: 'won',
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (updateError) throw updateError;

      // Log detailed activity with conversion metadata
      const activityDescription = `Lead converted to customer: ${lead.first_name} ${lead.last_name}${
        metadata?.conversion_reason ? ` (Reason: ${metadata.conversion_reason})` : ''
      }`;

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'lead',
        entity_id: leadId,
        action: 'converted',
        description: activityDescription,
        metadata: {
          customer_id: customer.id,
          conversion_reason: metadata?.conversion_reason,
          estimated_value: lead.estimated_value,
          lead_source: lead.source
        }
      });

      // Also log customer creation
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'customer',
        entity_id: customer.id,
        action: 'created',
        description: `Customer created from lead conversion: ${customer.first_name} ${customer.last_name}`,
        metadata: {
          lead_id: leadId,
          conversion_source: 'lead_conversion'
        }
      });

      toast.success(`Successfully converted ${lead.first_name} ${lead.last_name} to customer`);
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
