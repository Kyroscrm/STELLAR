
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary mb-6">
            Get In <span className="text-secondary">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your roofing project? Contact us today for a free estimate and consultation. We're here to answer all your questions and help you find the perfect solution for your home.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                        Service Needed
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select a service</option>
                        <option value="roof-replacement">Roof Replacement</option>
                        <option value="roof-repair">Roof Repair</option>
                        <option value="energy-retrofit">Energy Retrofit</option>
                        <option value="solar-integration">Solar Integration</option>
                        <option value="gutter-systems">Gutter Systems</option>
                        <option value="commercial">Commercial Roofing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Project Details
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about your project, timeline, and any specific requirements..."
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Phone className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-xl font-semibold text-primary">Call Us</h3>
                      <p className="text-gray-600">Speak with our experts</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <a href="tel:+1234567890" className="block text-lg font-semibold text-secondary hover:underline">
                      (123) 456-7890
                    </a>
                    <p className="text-sm text-gray-500">Available 24/7 for emergencies</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Mail className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-xl font-semibold text-primary">Email Us</h3>
                      <p className="text-gray-600">Get a detailed quote</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <a href="mailto:info@finalroofing.com" className="block text-lg font-semibold text-secondary hover:underline">
                      info@finalroofing.com
                    </a>
                    <p className="text-sm text-gray-500">We respond within 2 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-xl font-semibold text-primary">Visit Our Office</h3>
                      <p className="text-gray-600">Schedule an appointment</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <address className="text-lg not-italic">
                      123 Main Street<br />
                      Cityville, ST 12345
                    </address>
                    <Button variant="outline" size="sm">
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-xl font-semibold text-primary">Business Hours</h3>
                      <p className="text-gray-600">When we're available</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>7:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>8:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Emergency Only</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">Service Areas</h2>
            <p className="text-xl text-gray-600">Proudly serving homeowners throughout the region</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              "Cityville & Surrounding Areas",
              "Downtown Metropolitan District",
              "Suburban Communities",
              "Rural Properties",
              "Commercial Districts",
              "Historic Neighborhoods"
            ].map((area, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-primary">{area}</h3>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Don't see your area listed?</p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Us to Check
            </Button>
          </div>
        </div>
      </section>

      {/* Emergency Services */}
      <section className="py-20 bg-red-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold text-red-700 mb-4">
            Emergency Roofing Services
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Storm damage? Leak? We're available 24/7 for roofing emergencies.
          </p>
          <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
            <Phone className="h-5 w-5 mr-2" />
            Call Emergency Line: (123) 456-7890
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
