
import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Shield, Clock } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      title: "Complete Roof Replacement",
      description: "Full roof replacement with premium materials and expert craftsmanship.",
      features: ["25-year warranty", "Premium materials", "Expert installation", "Clean-up included"],
      price: "Starting at $12,000",
      popular: true
    },
    {
      title: "Roof Repairs",
      description: "Professional roof repairs for leaks, damage, and maintenance.",
      features: ["Quick response", "Quality materials", "Guaranteed work", "Emergency service"],
      price: "Starting at $500",
      popular: false
    },
    {
      title: "Energy Retrofits",
      description: "Improve your home's energy efficiency with modern retrofit solutions.",
      features: ["Energy savings", "Tax incentives", "Modern insulation", "Smart ventilation"],
      price: "Starting at $8,000",
      popular: false
    },
    {
      title: "Solar Integration",
      description: "Seamless solar panel integration with your new or existing roof.",
      features: ["Clean energy", "Reduce bills", "Professional install", "Monitoring system"],
      price: "Custom pricing",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary mb-6">
            Our <span className="text-secondary">Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From complete roof replacements to energy-efficient retrofits, we provide comprehensive roofing solutions tailored to your needs.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={`relative ${service.popular ? 'ring-2 ring-secondary shadow-lg' : 'shadow-md'}`}>
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-secondary text-primary px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">{service.title}</CardTitle>
                  <p className="text-gray-600">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t">
                      <div className="text-2xl font-bold text-primary mb-4">{service.price}</div>
                      <Button className="w-full bg-secondary text-primary hover:bg-secondary/90">
                        Get Free Estimate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">Why Choose Final Roofing?</h2>
            <p className="text-xl text-gray-600">Experience the difference quality makes</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-12 w-12 text-primary" />,
                title: "Licensed & Insured",
                description: "Fully licensed contractors with comprehensive insurance coverage for your peace of mind."
              },
              {
                icon: <Star className="h-12 w-12 text-secondary" />,
                title: "5-Star Rated",
                description: "Consistently rated 5 stars by our customers for quality work and exceptional service."
              },
              {
                icon: <Clock className="h-12 w-12 text-primary" />,
                title: "25-Year Warranty",
                description: "Industry-leading warranty on all our roofing work, backed by quality materials."
              }
            ].map((benefit, index) => (
              <Card key={index} className="text-center p-8">
                <div className="flex justify-center mb-6">{benefit.icon}</div>
                <h3 className="text-2xl font-semibold text-primary mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Contact us today for your free estimate and consultation.
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
