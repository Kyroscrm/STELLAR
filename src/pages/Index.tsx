
import React from 'react';
import Header from '@/components/Header';
import EstimateCalculator from '@/components/EstimateCalculator';
import BookingScheduler from '@/components/BookingScheduler';
import ProjectGallery from '@/components/ProjectGallery';
import ReviewsSection from '@/components/ReviewsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Shield, 
  Award, 
  Users, 
  CheckCircle,
  Star,
  Home,
  Wrench,
  Palette,
  Hammer
} from 'lucide-react';

const Index = () => {
  const services = [
    {
      icon: <Home className="h-8 w-8" />,
      title: 'Kitchen Remodeling',
      description: 'Transform your kitchen with custom cabinets, modern appliances, and beautiful countertops.',
      features: ['Custom Design', 'Premium Materials', 'Full Installation']
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: 'Bathroom Renovation',
      description: 'Create your dream bathroom with luxury fixtures, tile work, and spa-like amenities.',
      features: ['Luxury Fixtures', 'Custom Tile Work', 'Modern Design']
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: 'Home Additions',
      description: 'Expand your living space with seamless additions that match your homes architecture.',
      features: ['Architectural Design', 'Permit Handling', 'Quality Construction']
    },
    {
      icon: <Hammer className="h-8 w-8" />,
      title: 'Whole House Renovation',
      description: 'Complete home transformation from concept to completion with our expert team.',
      features: ['Full Planning', 'Project Management', 'Quality Guarantee']
    }
  ];

  const credentials = [
    { icon: <Shield className="h-6 w-6" />, text: 'Licensed & Insured' },
    { icon: <Award className="h-6 w-6" />, text: 'BBB A+ Rating' },
    { icon: <Users className="h-6 w-6" />, text: '20+ Years Experience' },
    { icon: <CheckCircle className="h-6 w-6" />, text: 'Quality Guaranteed' }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-primary mb-6 leading-tight">
              Transform Your
              <span className="block text-secondary">Dream Home</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Premium home renovation and construction services. Licensed, insured, and trusted by homeowners for over 20 years.
            </p>
            
            {/* Credentials */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {credentials.map((cred, index) => (
                <div key={index} className="flex items-center gap-2 text-primary bg-white px-4 py-2 rounded-full shadow-lg">
                  {cred.icon}
                  <span className="font-medium">{cred.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-secondary text-primary hover:bg-secondary/90 font-bold text-lg px-8 py-4 animate-float"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call (123) 456-7890
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white font-bold text-lg px-8 py-4"
              >
                View Our Work
              </Button>
            </div>
          </div>

          {/* Twin Tools Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="animate-slide-up">
              <EstimateCalculator />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <BookingScheduler />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              Our Premium Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From kitchens to whole house renovations, we deliver exceptional craftsmanship with attention to every detail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="text-primary mb-4 group-hover:text-secondary transition-colors">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Project Gallery */}
      <ProjectGallery />

      {/* Reviews Section */}
      <ReviewsSection />

      {/* About Section */}
      <section id="about" className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-heading font-bold mb-6">
                Why Choose ProBuild Contractors?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Licensed & Insured</h3>
                    <p className="text-primary-foreground/80">
                      Fully licensed contractors with comprehensive insurance coverage for your peace of mind.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Award-Winning Quality</h3>
                    <p className="text-primary-foreground/80">
                      BBB A+ rating and countless satisfied customers across the region.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
                    <p className="text-primary-foreground/80">
                      Skilled craftsmen with over 20 years of combined experience in home renovation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Satisfaction Guarantee</h3>
                    <p className="text-primary-foreground/80">
                      We stand behind our work with a comprehensive satisfaction guarantee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-6xl font-bold text-secondary mb-2">20+</div>
                <div className="text-xl mb-6">Years of Excellence</div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">500+</div>
                    <div className="text-sm">Projects Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">4.9</div>
                    <div className="text-sm flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      Rating
                    </div>
                  </div>
                </div>
                
                <Button className="bg-secondary text-primary hover:bg-secondary/90 font-bold">
                  Get Your Free Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Contact us today for a free consultation and estimate. Let's bring your vision to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Call Us</h3>
                <p className="text-gray-600 mb-4">Speak with our experts</p>
                <div className="space-y-2">
                  <div className="font-semibold text-lg">(123) 456-7890</div>
                  <div className="text-sm text-gray-500">Mon-Fri: 7AM-6PM</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Email Us</h3>
                <p className="text-gray-600 mb-4">Get a detailed response</p>
                <div className="space-y-2">
                  <div className="font-semibold">info@probuild.com</div>
                  <div className="text-sm text-gray-500">24-hour response</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Visit Us</h3>
                <p className="text-gray-600 mb-4">See our showroom</p>
                <div className="space-y-2">
                  <div className="font-semibold">123 Main Street</div>
                  <div className="text-sm text-gray-500">Your City, ST 12345</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-bold text-lg px-12 py-4">
              Schedule Free Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-heading font-bold mb-4">
                ProBuild<span className="text-secondary">Contractors</span>
              </h3>
              <p className="text-primary-foreground/80 mb-4">
                Your trusted partner for premium home renovation and construction services.
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-secondary text-primary">Licensed</Badge>
                <Badge className="bg-secondary text-primary">Insured</Badge>
                <Badge className="bg-secondary text-primary">BBB A+</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Kitchen Remodeling</li>
                <li>Bathroom Renovation</li>
                <li>Home Additions</li>
                <li>Whole House Renovation</li>
                <li>Custom Construction</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  (123) 456-7890
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  info@probuild.com
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  123 Main Street, Your City, ST
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Mon-Fri: 7AM-6PM
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <p className="text-primary-foreground/80 mb-4">
                Stay updated with our latest projects and tips.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-primary">
                  Facebook
                </Button>
                <Button variant="outline" size="sm" className="border-secondary text-secondary hover:bg-secondary hover:text-primary">
                  Instagram
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 ProBuild Contractors. All rights reserved. | Licensed & Insured</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
