
import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Lightbulb, TrendingUp, Users, Shield, Zap } from 'lucide-react';

const FeaturesPage = () => {
  const features = [
    {
      title: "Lead & Customer Management",
      description: "Efficiently capture, track, and nurture leads from initial contact to conversion. Manage customer profiles, communication history, and preferences in one centralized place.",
      icon: <Users className="h-12 w-12 text-primary" />,
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=300&fit=crop"
    },
    {
      title: "Project & Task Management",
      description: "Keep your projects on track with robust task management tools. Assign tasks, set deadlines, monitor progress, and collaborate seamlessly with your team.",
      icon: <CheckCircle className="h-12 w-12 text-primary" />,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c7ce?w=600&h=300&fit=crop"
    },
    {
      title: "Invoicing & Billing",
      description: "Generate professional invoices, track payments, and manage your billing cycles with ease. Automate reminders, recurring invoices, and integrate with payment gateways.",
      icon: <Lightbulb className="h-12 w-12 text-primary" />,
      image: "https://images.unsplash.com/photo-1557804506-669a67965da0?w=600&h=300&fit=crop"
    },
    {
      title: "Reporting & Analytics",
      description: "Gain valuable insights into your business performance with comprehensive reports and customizable dashboards. Make data-driven decisions to optimize your strategies.",
      icon: <TrendingUp className="h-12 w-12 text-primary" />,
      image: "https://images.unsplash.com/photo-1551288259-cd7c81741d52?w=600&h=300&fit=crop"
    },
    {
      title: "Automation & Workflows",
      description: "Automate repetitive tasks and streamline your workflows to save time and reduce manual errors. Create custom automation rules to fit your unique business processes.",
      icon: <Zap className="h-12 w-12 text-primary" />,
      image: "https://images.unsplash.com/photo-1556157382-97eda2d13296?w=600&h=300&fit=crop"
    },
    {
      title: "Security & Access Control",
      description: "Protect your sensitive data with robust security features and granular access control. Define roles and permissions for your team to ensure data integrity and privacy.",
      icon: <Shield className="h-12 w-12 text-primary" />,
      image: "https://images.unsplash.com/photo-1550522600-08777929b720?w=600&h=300&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary mb-6">
            Powerful <span className="text-secondary">CRM</span> Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            CAPTION offers a comprehensive suite of tools designed to help small businesses thrive.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-64">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    {feature.icon}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-primary mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
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
            Ready to Streamline Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your free trial today and experience the power of CAPTION.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-semibold">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
