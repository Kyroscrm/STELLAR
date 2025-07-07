
import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, CheckCircle, ArrowRight } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      title: "Lead & Customer Management",
      description: "Efficiently manage your leads and customer relationships from initial contact to long-term engagement. Track interactions, history, and preferences.",
      features: ["Centralized customer database", "Lead scoring & nurturing", "Communication tracking", "Customizable fields", "Segmentation & targeting"],
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=300&fit=crop",
      price: "Essential Plan",
      popular: true
    },
    {
      title: "Project & Task Management",
      description: "Keep your projects on track with robust task management tools. Assign tasks, set deadlines, and monitor progress in real-time.",
      features: ["Task assignment & tracking", "Gantt charts & timelines", "Resource allocation", "Progress monitoring", "Collaboration tools"],
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c7ce?w=600&h=300&fit=crop",
      price: "Pro Plan"
    },
    {
      title: "Invoicing & Billing",
      description: "Generate professional invoices, track payments, and manage your billing cycles with ease. Automate reminders and recurring invoices.",
      features: ["Customizable invoice templates", "Automated payment reminders", "Expense tracking", "Multi-currency support", "Payment gateway integrations"],
      image: "https://images.unsplash.com/photo-1557804506-669a67965da0?w=600&h=300&fit=crop",
      price: "Pro Plan"
    },
    {
      title: "Reporting & Analytics",
      description: "Gain valuable insights into your business performance with comprehensive reports and analytics. Make data-driven decisions.",
      features: ["Customizable dashboards", "Sales pipeline analysis", "Customer behavior reports", "Performance metrics", "Exportable data"],
      image: "https://images.unsplash.com/photo-1550522600-08777929b720?w=600&h=300&fit=crop",
      price: "Enterprise Plan"
    },
    {
      title: "Automation & Workflows",
      description: "Automate repetitive tasks and streamline your workflows to save time and reduce manual errors. Create custom automation rules.",
      features: ["Automated email sequences", "Task automation", "Workflow triggers", "Integration with third-party apps", "Customizable rules"],
      image: "https://images.unsplash.com/photo-1556157382-97eda2d13296?w=600&h=300&fit=crop",
      price: "Enterprise Plan"
    },
    {
      title: "Security & Access Control",
      description: "Protect your sensitive data with robust security features and granular access control. Define roles and permissions for your team.",
      features: ["Role-based access control", "Data encryption", "Audit trails", "Secure login (2FA)", "Compliance readiness"],
      image: "https://images.unsplash.com/photo-1550522600-08777929b720?w=600&h=300&fit=crop",
      price: "Enterprise Plan"
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
              Comprehensive <span className="text-secondary">CRM</span> Features
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Explore the powerful features of CAPTION designed to streamline your business operations, enhance customer relationships, and boost productivity.
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
              Why Choose CAPTION?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to delivering exceptional service and quality workmanship on every project.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Boost Productivity",
                description: "Automate tasks, streamline workflows, and manage your time effectively to get more done.",
                icon: "https://images.unsplash.com/photo-1517245386807-bb43f82c33d3?w=300&h=200&fit=crop"
              },
              {
                title: "Enhance Relationships",
                description: "Centralize customer data, track interactions, and personalize communication for stronger connections.",
                icon: "https://images.unsplash.com/photo-1552664730-d307ca884994?w=300&h=200&fit=crop"
              },
              {
                title: "Data-Driven Decisions",
                description: "Gain valuable insights with comprehensive reports and analytics to make informed business choices.",
                icon: "https://images.unsplash.com/photo-1551288259-cd7c81741d52?w=300&h=200&fit=crop"
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
            Get your free estimate today and discover why homeowners trust CAPTION.
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
