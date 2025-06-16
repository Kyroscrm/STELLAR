
import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const ReviewsPage = () => {
  const reviews = [
    {
      name: "Sarah Johnson",
      location: "Downtown District",
      rating: 5,
      date: "2 weeks ago",
      review: "Absolutely exceptional work! The team was professional, punctual, and the quality of work exceeded our expectations. Our new roof looks fantastic and we've already noticed improved energy efficiency.",
      service: "Complete Roof Replacement"
    },
    {
      name: "Mike Chen",
      location: "Suburban Area",
      rating: 5,
      date: "1 month ago",
      review: "Quick response for emergency repair during the storm. They had our leak fixed within 24 hours and followed up to ensure everything was perfect. Highly recommend!",
      service: "Emergency Roof Repair"
    },
    {
      name: "Lisa Rodriguez",
      location: "Historic Neighborhood",
      rating: 5,
      date: "6 weeks ago",
      review: "The energy retrofit has transformed our home. Our utility bills have dropped significantly, and the house stays comfortable year-round. Great investment!",
      service: "Energy Retrofit"
    },
    {
      name: "David Thompson",
      location: "New Development",
      rating: 5,
      date: "2 months ago",
      review: "From estimate to completion, everything was handled professionally. Clean work site, quality materials, and excellent communication throughout the project.",
      service: "Solar Integration"
    },
    {
      name: "Jennifer Walsh",
      location: "East Side",
      rating: 5,
      date: "3 months ago",
      review: "Best roofing company in the area! Fair pricing, quality work, and they stand behind their warranties. Our roof has performed flawlessly through two storm seasons.",
      service: "Roof Replacement"
    },
    {
      name: "Robert Kim",
      location: "City Center",
      rating: 5,
      date: "4 months ago",
      review: "Professional team that respects your property and time. They completed the work ahead of schedule and left the site cleaner than they found it. Will definitely use again.",
      service: "Gutter Installation"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary mb-6">
            Customer <span className="text-secondary">Reviews</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Don't just take our word for it. See what our satisfied customers have to say about their experience with Final Roofing & Retro-Fit.
          </p>
          
          {/* Overall Rating */}
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div className="text-4xl font-bold text-primary mb-2">5.0</div>
            <div className="flex justify-center mb-2">
              {renderStars(5)}
            </div>
            <div className="text-gray-600">Based on 50+ reviews</div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {reviews.map((review, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-primary">{review.name}</h3>
                      <p className="text-gray-600">{review.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex mb-1">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Quote className="h-8 w-8 text-secondary mb-2" />
                    <p className="text-gray-700 italic mb-4">"{review.review}"</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-primary">Service: {review.service}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">Trusted by the Community</h2>
            <p className="text-xl text-gray-600">Our reputation speaks for itself</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Happy Customers" },
              { number: "15+", label: "Years Experience" },
              { number: "5.0", label: "Average Rating" },
              { number: "100%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Ready to Join Our Happy Customers?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the quality and service that has earned us 5-star reviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-semibold">
              Get Free Estimate
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Read More Reviews
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReviewsPage;
