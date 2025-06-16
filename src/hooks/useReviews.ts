
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Review {
  id: string;
  name: string;
  rating: number;
  review_date: string;
  text_content: string;
  platform: string;
  verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export const useReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('review_date', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setReviews(prev => [data, ...prev]);
      toast.success('Review created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating review:', error);
      toast.error('Failed to create review');
      return null;
    }
  };

  const updateReview = async (id: string, updates: Partial<Omit<Review, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setReviews(prev => prev.map(review => 
        review.id === id ? data : review
      ));
      toast.success('Review updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
      return false;
    }
  };

  const deleteReview = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setReviews(prev => prev.filter(review => review.id !== id));
      toast.success('Review deleted successfully');
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  return {
    reviews,
    loading,
    createReview,
    updateReview,
    deleteReview,
    fetchReviews
  };
};
