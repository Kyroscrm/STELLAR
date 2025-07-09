import BookingScheduler from '@/components/BookingScheduler';
import EstimateCalculator from '@/components/EstimateCalculator';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  Users,
} from 'lucide-react';

interface Service {
  title: string;
  description: string;
  image: string;
}

const services: Service[] = [
  {
    title: 'Lead Management',
    description:
      'Capture, track, and nurture leads from inquiry to conversion.',
    image:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=250&fit=crop',
  },
  {
    title: 'Project Tracking',
    description:
      'Monitor project progress, tasks, and team assignments in real-time.',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c7ce?w=400&h=250&fit=crop',
  },
  {
    title: 'Invoicing & Payments',
    description:
      'Generate professional invoices and track payments effortlessly.',
    image:
      'https://images.unsplash.com/photo-1557804506-669a67965da0?w=400&h=250&fit=crop',
  },
];

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
                  CAPTION: Your{' '}
                  <span className="text-secondary">Affordable</span> CRM
                  Solution
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Streamline your business operations with CAPTION, the
                  comprehensive CRM designed for small business owners. Manage
                  leads, projects, invoices, and more, all in one place.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-secondary text-primary hover:bg-secondary/90 font-semibold text-lg px-8 py-4"
                >
                  Get Free Estimate
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-primary text-primary hover:bg-primary hover:text-white font-semibold text-lg px-8 py-4"
                >
                  <Link to="/gallery">
                    View Our Work
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    sessionStorage.setItem('loginAccess', 'granted');
                    window.location.href = '/login';
                  }}
                  className="bg-primary text-white hover:bg-primary/90 font-semibold text-lg px-8 py-4"
                >
                  CRM Sign In
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">
                    Licensed & Insured
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-secondary" />
                  <span className="text-sm font-medium">5-Star Rated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">
                    500+ Happy Clients
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:order-last">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl transform rotate-3" />
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop"
                  alt="CRM dashboard showing data analytics"
                  className="relative rounded-3xl shadow-2xl w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-primary mb-4">
              Key CRM Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover how CAPTION can transform your business operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {services.map((service, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative h-48 overflow-hidden rounded-lg mb-4">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-white text-xl font-semibold">
                    {service.title}
                  </h3>
                </div>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Link to="/services">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Estimate Calculator & Booking */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-heading font-bold text-primary mb-8">
                Get Your Instant Estimate
              </h2>
              <EstimateCalculator />
            </div>
            <div>
              <h2 className="text-3xl font-heading font-bold text-primary mb-8">
                Schedule Your Consultation
              </h2>
              <BookingScheduler />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-primary mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600">
              Contact us today for your free estimate
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">
                Call Us
              </h3>
              <a
                href="tel:+1234567890"
                className="text-secondary font-semibold hover:underline"
              >
                (346) 849-3169
              </a>
            </div>

            <div className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">
                Email Us
              </h3>
              <a
                href="mailto:newdarkorbit@outlook.com"
                className="text-secondary font-semibold hover:underline"
              >
                newdarkorbit@outlook.com
              </a>
            </div>

            <div className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">
                Visit Us
              </h3>
              <Button variant="outline" asChild>
                <Link to="/contact">Get Directions</Link>
              </Button>
            </div>
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
                  src="/caption-logo.png"
                  alt="CAPTION Logo"
                  className="h-10 w-auto"
                />
                <h3 className="text-2xl font-heading font-bold">CAPTION</h3>
              </div>
              <p className="text-white/80">
                Streamline your business operations with CAPTION. Manage leads,
                projects, and invoices efficiently.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-white/80">
                <li>
                  <Link
                    to="/services"
                    className="hover:text-secondary transition-colors"
                  >
                    Lead Management
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="hover:text-secondary transition-colors"
                  >
                    Project Tracking
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="hover:text-secondary transition-colors"
                  >
                    Invoicing & Payments
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="hover:text-secondary transition-colors"
                  >
                    Reporting
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/80">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-secondary transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/gallery"
                    className="hover:text-secondary transition-colors"
                  >
                    Our Work
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reviews"
                    className="hover:text-secondary transition-colors"
                  >
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-secondary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-white/80">
                <p>(346) 849-3169</p>
                <p>newdarkorbit@outlook.com</p>
                <p>
                  123 Main Street
                  <br />
                  Cityville, ST 12345
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 flex justify-between items-center">
            <div className="text-white/60">
              <p>&copy; {'2024'} CAPTION. All rights reserved.</p>
            </div>
            <div className="flex items-center">
              <img
                src="/caption-logo.png"
                alt="CAPTION CRM Logo"
                className="h-8 w-auto opacity-50"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
