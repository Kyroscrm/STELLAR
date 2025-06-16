
import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, CheckCircle, ArrowRight } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      title: "Complete Roof Replacement",
      description: "Full roof replacement with premium materials and expert craftsmanship. We use only the highest quality materials with comprehensive warranties.",
      features: ["25-year warranty", "Energy efficient materials", "Professional installation", "Free inspection", "Insurance claim assistance"],
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=300&fit=crop",
      price: "Starting at $8,500",
      popular: true
    },
    {
      title: "Roof Repairs & Maintenance",
      description: "Fast, reliable repairs to extend your roof's lifespan. Emergency services available 24/7 for urgent issues.",
      features: ["Emergency repairs", "Preventive maintenance", "Storm damage restoration", "Leak detection", "Gutter cleaning"],
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=300&fit=crop",
      price: "Starting at $350"
    },
    {
      title: "Energy Retrofit Solutions",
      description: "Improve your home's efficiency with modern retrofit solutions that reduce energy costs and increase comfort.",
      features: ["Insulation upgrades", "Ventilation systems", "Cool roof technology", "Energy audits", "Rebate assistance"],
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=300&fit=crop",
      price: "Starting at $2,500"
    },
    {
      title: "Solar Integration",
      description: "Seamless solar panel integration with roofing systems. Maximize your energy savings with professional installation.",
      features: ["Solar-ready roofing", "Panel installation", "Energy monitoring", "Net metering setup", "Financing options"],
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=300&fit=crop",
      price: "Custom pricing"
    },
    {
      title: "Gutter Systems",
      description: "Complete gutter installation and maintenance services to protect your home's foundation and landscaping.",
      features: ["Seamless gutters", "Gutter guards", "Downspout systems", "Drainage solutions", "Regular maintenance"],
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=300&fit=crop",
      price: "Starting at $1,200"
    },
    {
      title: "Commercial Roofing",
      description: "Professional commercial roofing solutions for businesses. Minimize downtime with efficient project management.",
      features: ["Flat roof systems", "Metal roofing", "Maintenance contracts", "Emergency services", "Warranty programs"],
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=300&fit=crop",
      price: "Custom pricing"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary mb-6">
              Professional <span className="text-secondary">Roofing</span> Services
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              From complete roof replacements to energy-efficient retrofits, we deliver premium solutions tailored to your needs. Licensed, insured, and backed by our satisfaction guarantee.
            </p>
            <div className="flex justify-center items-center gap-8">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-medium">Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-secondary" />
                <span className="font-medium">5-Star Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="font-medium">Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
                {service.popular && (
                  <Badge className="absolute top-4 right-4 z-10 bg-secondary text-primary">
                    Most Popular
                  </Badge>
                )}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                    <p className="text-secondary font-semibold text-lg">{service.price}</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6 text-lg">{service.description}</p>
                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-primary hover:bg-primary/90">
                      Get Free Estimate
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              Why Choose Final Roofing & Retro-Fit?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to delivering exceptional service and quality workmanship on every project.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Expert Craftsmanship",
                description: "Our team brings decades of combined experience to every project",
                icon: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop"
              },
              {
                title: "Premium Materials",
                description: "We use only the highest quality materials from trusted manufacturers",
                icon: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop"
              },
              {
                title: "Customer Satisfaction",
                description: "100% satisfaction guarantee with comprehensive warranties",
                icon: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop"
              }
            ].map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={item.icon} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get your free estimate today and discover why homeowners trust Final Roofing & Retro-Fit.
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

export default ServicesPage;
