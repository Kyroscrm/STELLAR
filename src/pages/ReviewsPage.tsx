
import React from 'react';
import Header from '@/components/Header';
import ReviewsSection from '@/components/ReviewsSection';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

const ReviewsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-8 w-8 text-secondary fill-current" />
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary mb-6">
            Customer <span className="text-secondary">Reviews</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Don't just take our word for it. Read what our satisfied customers have to say about their experience with Final Roofing & Retro-Fit.
          </p>
          <div className="bg-white rounded-lg p-6 inline-block shadow-lg">
            <div className="text-4xl font-bold text-primary">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
            <div className="text-sm text-gray-500">Based on 247 reviews</div>
          </div>
        </div>
      </section>

      {/* Reviews Component */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ReviewsSection />
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              Trusted by Homeowners
            </h2>
            <p className="text-xl text-gray-600">
              Our commitment to excellence shows in every review
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">247</div>
              <div className="text-gray-600">Customer Reviews</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
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
            Experience the quality and service that our customers rave about.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-semibold">
              Get Free Estimate
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Call (123) 456-7890
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReviewsPage;
