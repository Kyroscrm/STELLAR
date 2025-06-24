import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type SignedDocumentsRow = Database['public']['Tables']['signed_documents']['Row'];

export interface SignedDocument {
  id: string;
  user_id: string;
  document_name: string;
  document_url: string;
  signer_email: string;
  signer_name: string | null;
  signature_data: string | null;
  signed_at: string | null;
  expires_at: string | null;
  status: 'pending' | 'signed' | 'expired' | 'cancelled';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useDocumentSignature = () => {
  const [documents, setDocuments] = useState<SignedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('signed_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: SignedDocument[] = (data || []).map((item: SignedDocumentsRow) => ({
        ...item,
        status: item.status as 'pending' | 'signed' | 'expired' | 'cancelled',
        metadata: (item.metadata as Record<string, any>) || {}
      }));

      setDocuments(transformedData);
    } catch (error: unknown) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (documentData: Omit<SignedDocument, 'id' | 'user_id' | 'signature_data' | 'signed_at' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('signed_documents')
        .insert({ ...documentData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      const transformedData: SignedDocument = {
        ...data,
        status: data.status as 'pending' | 'signed' | 'expired' | 'cancelled',
        metadata: (data.metadata as Record<string, any>) || {}
      };

      setDocuments(prev => [transformedData, ...prev]);
      toast.success('Document created successfully');
      return transformedData;
    } catch (error: unknown) {
      toast.error('Failed to create document');
      return null;
    }
  };

  const signDocument = async (id: string, signatureData: string) => {
    try {
      const { data, error } = await supabase
        .from('signed_documents')
        .update({
          signature_data: signatureData,
          signed_at: new Date().toISOString(),
          status: 'signed'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const transformedData: SignedDocument = {
        ...data,
        status: data.status as 'pending' | 'signed' | 'expired' | 'cancelled',
        metadata: (data.metadata as Record<string, any>) || {}
      };

      setDocuments(prev => prev.map(doc => doc.id === id ? transformedData : doc));
      toast.success('Document signed successfully');
      return transformedData;
    } catch (error: unknown) {
      toast.error('Failed to sign document');
      return null;
    }
  };

  const updateDocumentStatus = async (id: string, status: SignedDocument['status']) => {
    try {
      const { data, error } = await supabase
        .from('signed_documents')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const transformedData: SignedDocument = {
        ...data,
        status: data.status as 'pending' | 'signed' | 'expired' | 'cancelled',
        metadata: (data.metadata as Record<string, any>) || {}
      };

      setDocuments(prev => prev.map(doc => doc.id === id ? transformedData : doc));
      toast.success('Document status updated');
      return transformedData;
    } catch (error: unknown) {
      toast.error('Failed to update document status');
      return null;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  return {
    documents,
    loading,
    fetchDocuments,
    createDocument,
    signDocument,
    updateDocumentStatus
  };
};
