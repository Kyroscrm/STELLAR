
import React, { useState, useEffect } from 'react';
import { Star, Quote, ThumbsUp, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  platform: 'google' | 'yelp' | 'bbb' | 'angi';
  verified: boolean;
  helpful: number;
}

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const mockReviews: Review[] = [
    {
      id: '1',
      name: 'Sarah M.',
      rating: 5,
      date: '2024-01-15',
      text: 'ProBuild completely transformed our kitchen! The team was professional, on time, and the quality exceeded our expectations. They handled every detail and kept us informed throughout the process.',
      platform: 'google',
      verified: true,
      helpful: 12
    },
    {
      id: '2',
      name: 'Michael R.',
      rating: 5,
      date: '2024-01-10',
      text: 'Outstanding work on our basement renovation. The project was completed on schedule and within budget. The crew was respectful of our home and cleaned up thoroughly each day.',
      platform: 'yelp',
      verified: true,
      helpful: 8
    },
    {
      id: '3',
      name: 'Jennifer L.',
      rating: 5,
      date: '2024-01-05',
      text: 'We hired ProBuild for a bathroom remodel and couldn\'t be happier. The attention to detail is incredible and they helped us make design decisions that perfectly matched our vision.',
      platform: 'bbb',
      verified: true,
      helpful: 15
    },
    {
      id: '4',
      name: 'David K.',
      rating: 5,
      date: '2023-12-28',
      text: 'Excellent experience from start to finish. The estimate was detailed and fair, the timeline was realistic, and the final result is beautiful. Highly recommend for any home renovation project.',
      platform: 'angi',
      verified: true,
      helpful: 6
    },
    {
      id: '5',
      name: 'Amanda T.',
      rating: 5,
      date: '2023-12-20',
      text: 'ProBuild added a second story to our home and the process was seamless. They coordinated all permits and inspections, and their communication was excellent throughout the entire project.',
      platform: 'google',
      verified: true,
      helpful: 11
    },
    {
      id: '6',
      name: 'Robert H.',
      rating: 4,
      date: '2023-12-15',
      text: 'Great work on our deck installation. The team was skilled and efficient. Only minor delay due to weather, but they kept us informed and made up the time. Very satisfied with the results.',
      platform: 'yelp',
      verified: true,
      helpful: 4
    }
  ];

  useEffect(() => {
    setReviews(mockReviews);
  }, []);

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

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
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

  return (
    <section id="reviews" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-primary mb-4">
            What Our Clients Say
          </h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <StarRating rating={Math.round(averageRating)} size="lg" />
            <span className="text-2xl font-bold text-primary">{averageRating.toFixed(1)}</span>
            <span className="text-gray-600">({totalReviews} reviews)</span>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our satisfied clients have to say about their experience with ProBuild Contractors.
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
                        {new Date(review.date).toLocaleDateString()}
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
                    {review.text}
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
                    <span>{review.helpful}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Review Platform Links */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-primary mb-4">
            Read More Reviews
          </h3>
          <p className="text-gray-600 mb-6">
            Check out our reviews on your favorite platform
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <span>🔵</span>
              Google Reviews
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <span>🔴</span>
              Yelp Reviews
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <span>🏛️</span>
              BBB Profile
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
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
            Leave a review and get 5% off your next project.
          </p>
          <Button className="bg-secondary text-primary hover:bg-secondary/90 font-semibold">
            Leave a Review & Save 5%
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
