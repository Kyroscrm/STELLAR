
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import React, { useState } from 'react';

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
    // Form submission functionality would be implemented here
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
            Contact <span className="text-secondary">CAPTION</span> Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about CAPTION? Need assistance with your account? Our team is here to help you streamline your business operations.
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
                        placeholder="(346) 849-3169"
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
                        <option value="">Select a topic</option>
                        <option value="lead-management">Lead Management</option>
                        <option value="project-tracking">Project Tracking</option>
                        <option value="invoicing-billing">Invoicing & Billing</option>
                        <option value="reporting-analytics">Reporting & Analytics</option>
                        <option value="technical-support">Technical Support</option>
                        <option value="other">Other Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about your inquiry or how we can help..."
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
                      (346) 849-3169
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
                    <a href="mailto:newdarkorbit@outlook.com" className="block text-lg font-semibold text-secondary hover:underline">
                      newdarkorbit@outlook.com
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

      
    </div>
  );
};

export default ContactPage;
