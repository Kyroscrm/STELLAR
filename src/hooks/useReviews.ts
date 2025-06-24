import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
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

// Type guard to validate review data
const isValidReview = (data: unknown): data is Review => {
  // For now, trust the Supabase data and cast to Review type
  return typeof data === 'object' && data !== null;
};

// Helper function to safely convert Supabase data to Review
const convertToReview = (data: unknown): Review => {
  const reviewData = data as Record<string, unknown>;
  return {
    id: reviewData.id as string,
    name: (reviewData.name as string) || '',
    rating: Math.max(1, Math.min(5, (reviewData.rating as number) || 1)),
    review_date: (reviewData.review_date as string) || new Date().toISOString().split('T')[0],
    text_content: (reviewData.text_content as string) || '',
    platform: (reviewData.platform as string) || 'website',
    verified: typeof reviewData.verified === 'boolean' ? reviewData.verified : false,
    helpful_count: typeof reviewData.helpful_count === 'number' ? reviewData.helpful_count : 0,
    created_at: reviewData.created_at as string,
    updated_at: reviewData.updated_at as string
  };
};

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

      // Safely convert and validate all reviews
      const safeReviews = (data || [])
        .filter(isValidReview)
        .map(convertToReview);

      setReviews(safeReviews);
    } catch (error: unknown) {
      // Error handled - review fetch functionality preserved
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    // Validate input data
    if (!isValidReview({ ...reviewData, id: 'temp' })) {
      toast.error('Invalid review data');
      return null;
    }

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

      const safeReview = convertToReview(data);
      setReviews(prev => [safeReview, ...prev]);
      toast.success('Review created successfully');
      return safeReview;
    } catch (error: unknown) {
      // Error handled - review creation functionality preserved
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

      const safeReview = convertToReview(data);
      setReviews(prev => prev.map(review =>
        review.id === id ? safeReview : review
      ));
      toast.success('Review updated successfully');
      return true;
    } catch (error: unknown) {
      // Error handled - review update functionality preserved
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
    } catch (error: unknown) {
      // Error handled - review deletion functionality preserved
      toast.error('Failed to delete review');
    }
  };

  // Get average rating
  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  };

  // Get rating distribution
  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
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
    fetchReviews,
    getAverageRating,
    getRatingDistribution
  };
};
