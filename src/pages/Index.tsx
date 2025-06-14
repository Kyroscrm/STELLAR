
import React from 'react';
import Header from '@/components/Header';
import EstimateCalculator from '@/components/EstimateCalculator';
import BookingScheduler from '@/components/BookingScheduler';
import ProjectGallery from '@/components/ProjectGallery';
import ReviewsSection from '@/components/ReviewsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Star, Users, Phone, Mail, MapPin } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary leading-tight">
                  Premium <span className="text-secondary">Roofing</span> &<br />
                  Retrofit Solutions
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform your home with expert roofing, energy-efficient retrofits, and premium renovation services. Licensed, insured, and trusted by homeowners across the region.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-semibold text-lg px-8 py-4">
                  Get Free Estimate
                </Button>
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white font-semibold text-lg px-8 py-4">
                  View Our Work
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Licensed & Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-secondary" />
                  <span className="text-sm font-medium">5-Star Rated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">500+ Happy Clients</span>
                </div>
              </div>
            </div>

            <div className="lg:order-last">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl transform rotate-3"></div>
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop"
                  alt="Modern home with professional roofing work"
                  className="relative rounded-3xl shadow-2xl w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estimate Calculator & Booking */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-heading font-bold text-primary mb-8">Get Your Instant Estimate</h2>
              <EstimateCalculator />
            </div>
            <div>
              <h2 className="text-3xl font-heading font-bold text-primary mb-8">Schedule Your Consultation</h2>
              <BookingScheduler />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              Our Specialized Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From complete roof replacements to energy-efficient retrofits, we deliver premium solutions for your home.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Complete Roof Replacement",
                description: "Full roof replacement with premium materials and expert craftsmanship",
                features: ["25-year warranty", "Energy efficient materials", "Professional installation"],
                image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop"
              },
              {
                title: "Roof Repairs & Maintenance",
                description: "Fast, reliable repairs to extend your roof's lifespan",
                features: ["Emergency repairs", "Preventive maintenance", "Storm damage restoration"],
                image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=250&fit=crop"
              },
              {
                title: "Energy Retrofit Solutions",
                description: "Improve your home's efficiency with modern retrofit solutions",
                features: ["Insulation upgrades", "Ventilation systems", "Cool roof technology"],
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop"
              },
              {
                title: "Solar Integration",
                description: "Seamless solar panel integration with roofing systems",
                features: ["Solar-ready roofing", "Panel installation", "Energy monitoring"],
                image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=250&fit=crop"
              },
              {
                title: "Gutter Systems",
                description: "Complete gutter installation and maintenance services",
                features: ["Seamless gutters", "Gutter guards", "Downspout systems"],
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop"
              },
              {
                title: "Commercial Roofing",
                description: "Professional commercial roofing solutions for businesses",
                features: ["Flat roof systems", "Metal roofing", "Maintenance contracts"],
                image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop"
              }
            ].map((service, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-white text-xl font-semibold">{service.title}</h3>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Project Gallery */}
      <ProjectGallery />

      {/* Reviews Section */}
      <section id="reviews" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Real reviews from real customers
            </p>
          </div>
          <ReviewsSection />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-heading font-bold text-primary mb-6">
                Why Choose Final Roofing & Retro-Fit?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Licensed & Insured</h3>
                    <p className="text-gray-600">Fully licensed contractors with comprehensive insurance coverage for your peace of mind.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Premium Quality</h3>
                    <p className="text-gray-600">We use only the highest quality materials and employ skilled craftsmen for every project.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Expert Team</h3>
                    <p className="text-gray-600">Our experienced team brings decades of combined experience to every project.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop"
                alt="Professional roofing team at work"
                className="rounded-3xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              Get Your Free Estimate Today
            </h2>
            <p className="text-xl text-gray-600">
              Ready to start your roofing project? Contact us for a free, no-obligation estimate.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">Speak with our experts</p>
              <a href="tel:+1234567890" className="text-secondary font-semibold hover:underline">
                (123) 456-7890
              </a>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">Get a detailed quote</p>
              <a href="mailto:info@finalroofing.com" className="text-secondary font-semibold hover:underline">
                info@finalroofing.com
              </a>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-4">Our office location</p>
              <p className="text-secondary font-semibold">
                123 Main Street<br />
                Cityville, ST 12345
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/lovable-uploads/f6ae6373-2ac3-4ff4-8436-389ab0da2914.png" 
                  alt="Final Roofing & Retro-Fit Logo" 
                  className="h-10 w-auto"
                />
                <h3 className="text-2xl font-heading font-bold">
                  Final <span className="text-secondary">Roofing</span> & Retro-Fit
                </h3>
              </div>
              <p className="text-white/80">
                Premium roofing and retrofit solutions for your home. Licensed, insured, and trusted.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-white/80">
                <li>Roof Replacement</li>
                <li>Roof Repairs</li>
                <li>Energy Retrofits</li>
                <li>Solar Integration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/80">
                <li>About Us</li>
                <li>Our Work</li>
                <li>Reviews</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-white/80">
                <p>(123) 456-7890</p>
                <p>info@finalroofing.com</p>
                <p>123 Main Street<br />Cityville, ST 12345</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 Final Roofing & Retro-Fit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
