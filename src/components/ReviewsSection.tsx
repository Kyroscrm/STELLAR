
import React, { useState, useEffect } from 'react';
import { Star, Quote, ThumbsUp, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReviews } from '@/hooks/useReviews';
import LoadingSpinner from '@/components/LoadingSpinner';

const ReviewsSection = () => {
  const { reviews, loading, getAverageRating } = useReviews();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const platforms = [
    { id: 'all', label: 'All Reviews', logo: '⭐' },
    { id: 'google', label: 'Google', logo: '🔵' },
    { id: 'yelp', label: 'Yelp', logo: '🔴' },
    { id: 'bbb', label: 'BBB', logo: '🏛️' },
    { id: 'angi', label: 'Angi', logo: '🔨' }
  ];

  const filteredReviews = selectedPlatform === 'all' 
    ? reviews 
    : reviews.filter(review => review.platform === selectedPlatform);

  const averageRating = getAverageRating();
  const totalReviews = reviews.length;

  const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} ${
              star <= rating ? 'fill-secondary text-secondary' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleReviewButtonClick = () => {
    window.open('https://g.co/kgs/Autr3zW', '_blank');
  };

  const handlePlatformButtonClick = (platform: string) => {
    const urls: Record<string, string> = {
      google: 'https://g.co/kgs/Autr3zW',
      yelp: 'https://www.yelp.com/biz/final-roofing-retro-fit',
      bbb: 'https://www.bbb.org/us/ca/final-roofing-retro-fit',
      angi: 'https://www.angi.com/companyprofile/final-roofing-retro-fit'
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  };

  if (loading) {
    return (
      <section id="reviews" className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-primary mb-4">
            What Our Clients Say
          </h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <StarRating rating={Math.round(averageRating)} size="lg" />
            <span className="text-2xl font-bold text-primary">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-gray-600">
              ({totalReviews} reviews)
            </span>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our satisfied clients have to say about their experience with Final Roofing & Retro-Fit.
          </p>
        </div>

        {/* Platform Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {platforms.map(platform => (
            <Button
              key={platform.id}
              variant={selectedPlatform === platform.id ? "default" : "outline"}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`${selectedPlatform === platform.id ? "bg-primary text-white" : ""} flex items-center gap-2`}
            >
              <span>{platform.logo}</span>
              {platform.label}
            </Button>
          ))}
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredReviews.map(review => (
              <Card key={review.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {review.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-primary">{review.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.review_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <Quote className="absolute -top-2 -left-1 h-6 w-6 text-primary/20" />
                    <p className="text-gray-700 italic pl-5">
                      {review.text_content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-medium text-primary">
                        {platforms.find(p => p.id === review.platform)?.logo} {review.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{review.helpful_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No reviews found for the selected platform.</p>
            <Button variant="outline" onClick={() => setSelectedPlatform('all')}>
              Show All Reviews
            </Button>
          </div>
        )}

        {/* Review Platform Links */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-primary mb-4">
            Read More Reviews
          </h3>
          <p className="text-gray-600 mb-6">
            Check out our reviews on your favorite platform
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => handlePlatformButtonClick('google')}>
              <span>🔵</span>
              Google Reviews
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => handlePlatformButtonClick('yelp')}>
              <span>🔴</span>
              Yelp Reviews
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => handlePlatformButtonClick('bbb')}>
              <span>🏛️</span>
              BBB Profile
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => handlePlatformButtonClick('angi')}>
              <span>🔨</span>
              Angi Reviews
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Review Incentive */}
        <div className="mt-12 bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Share Your Experience
          </h3>
          <p className="mb-6">
            Completed a project with us? We'd love to hear about your experience! 
            Leave a review to help other homeowners.
          </p>
          <Button 
            className="bg-secondary text-primary hover:bg-secondary/90 font-semibold"
            onClick={handleReviewButtonClick}
          >
            Leave a Review
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
