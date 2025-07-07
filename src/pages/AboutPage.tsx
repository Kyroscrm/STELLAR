
import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Star, Users, Award, Clock, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Mike Thompson",
      role: "Founder & Lead Contractor",
      experience: "20+ years",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&face=1",
      bio: "Mike founded CAPTION with a vision to provide honest, quality services. Licensed master contractor with expertise in all service systems."
    },
    {
      name: "Sarah Davis",
      role: "Project Manager",
      experience: "12+ years",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b882?w=300&h=300&fit=crop&face=1",
      bio: "Sarah ensures every project runs smoothly from start to finish. She coordinates with clients and crews to deliver exceptional results on time."
    },
    {
      name: "Alex Johnson",
      role: "Energy Efficiency Specialist",
      experience: "8+ years",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&face=1",
      bio: "Alex specializes in energy retrofits and sustainable service solutions. Certified in the latest energy-efficient technologies and rebate programs."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary mb-6">
                About <span className="text-secondary">CAPTION</span> CRM
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                CAPTION is a revolutionary CRM designed in 2025 to empower small business owners worldwide. We provide an affordable, simple, and powerful solution to manage your customer relationships, projects, and sales with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-semibold">
                  Get Free Estimate
                </Button>
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Call (346) 849-3169
                </Button>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop"
                alt="CRM dashboard showing various features"
                className="rounded-3xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold text-primary mb-8">Our Mission</h2>
            <div className="space-y-6 text-lg text-gray-600">
              <p>
                CAPTION was founded in 2025 with a clear mission: to democratize powerful CRM capabilities for small business owners. We saw a gap in the market for an affordable, intuitive, and comprehensive solution that didn't require extensive training or a large budget.
              </p>
              <p>
                We believe that every business, regardless of size, deserves access to tools that can help them grow. Our platform is built on the principles of simplicity, efficiency, and affordability, ensuring that you can focus on what you do best – serving your customers.
              </p>
              <p>
                From lead management to project tracking and invoicing, CAPTION is designed to streamline your operations, enhance customer relationships, and provide the insights you need to make informed decisions. We are constantly evolving, adding new features and refining existing ones based on user feedback and market needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-12 w-12 text-primary" />,
                title: "Integrity",
                description: "We believe in honest communication, fair pricing, and doing what we say we'll do. No surprises, no hidden costs."
              },
              {
                icon: <Star className="h-12 w-12 text-secondary" />,
                title: "Quality",
                description: "We use only premium materials and employ skilled craftsmen who take pride in their work. Every project reflects our commitment to excellence."
              },
              {
                icon: <Users className="h-12 w-12 text-primary" />,
                title: "Customer Focus",
                description: "Your satisfaction is our priority. We listen to your needs, communicate clearly, and ensure you're happy with every aspect of your project."
              }
            ].map((value, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-6">{value.icon}</div>
                <h3 className="text-2xl font-semibold text-primary mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The experts behind every successful project</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary mb-1">{member.name}</h3>
                  <p className="text-secondary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-500 mb-4">{member.experience} experience</p>
                  <p className="text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">Our Credentials</h2>
            <p className="text-xl text-gray-600">Licensed, insured, and certified professionals</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-primary" />,
                title: "Certified CRM Provider",
                description: "Officially recognized and certified CRM solution for small businesses."
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-green-600" />,
                title: "Data Security Compliant",
                description: "Adheres to industry best practices for data protection and privacy."
              },
              {
                icon: <Award className="h-8 w-8 text-secondary" />,
                title: "Award-Winning Support",
                description: "Recognized for exceptional customer service and user satisfaction."
              },
              {
                icon: <Clock className="h-8 w-8 text-primary" />,
                title: "Continuous Innovation",
                description: "Regular updates and new features based on user feedback and market trends."
              }
            ].map((credential, index) => (
              <Card key={index} className="text-center p-6">
                <div className="flex justify-center mb-4">{credential.icon}</div>
                <h3 className="font-semibold text-primary mb-2">{credential.title}</h3>
                <p className="text-sm text-gray-600">{credential.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Discover how CAPTION can help you manage your leads, projects, and customer relationships more effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-semibold">
              Get Free Estimate
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
