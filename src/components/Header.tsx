
import React, { useState } from 'react';
import { Phone, Mail, User, Menu, X, Briefcase, Users, FileText, Calendar, Receipt, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const crmNavItems = [
    { title: 'Dashboard', href: '/admin', icon: Briefcase },
    { title: 'Leads', href: '/admin/leads', icon: UserPlus },
    { title: 'Customers', href: '/admin/customers', icon: Users },
    { title: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { title: 'Estimates', href: '/admin/estimates', icon: FileText },
    { title: 'Invoices', href: '/admin/invoices', icon: Receipt },
    { title: 'Tasks', href: '/admin/tasks', icon: Calendar },
  ];

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
      {/* Top contact bar */}
      <div className="bg-primary text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-secondary transition-colors">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">(123) 456-7890</span>
            </a>
            <a href="mailto:info@finalroofing.com" className="flex items-center gap-2 hover:text-secondary transition-colors">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">info@finalroofing.com</span>
            </a>
          </div>
          <div className="text-xs">
            Licensed • Insured • BBB A+ Rated
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/f6ae6373-2ac3-4ff4-8436-389ab0da2914.png" 
                alt="Final Roofing & Retro-Fit Logo" 
                className="h-12 w-auto"
              />
              <h1 className="text-2xl font-heading font-bold text-primary">
                Final <span className="text-secondary">Roofing</span> & Retro-Fit
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* CRM Navigation for admin/staff users */}
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <div className="flex items-center space-x-4 mr-8 border-r pr-8">
                {crmNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Public site navigation */}
            <Link to="/services" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Services
            </Link>
            <Link to="/gallery" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Gallery
            </Link>
            <Link to="/reviews" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Reviews
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Auth and CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleAuthClick} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.role === 'admin' ? 'CRM Dashboard' : user.role === 'staff' ? 'Staff Portal' : 'My Projects'}
                </Button>
                <Button variant="ghost" onClick={handleLogout} size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={handleAuthClick} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Login
              </Button>
            )}
            <Button className="bg-secondary text-primary hover:bg-secondary/90 font-semibold">
              Get Free Estimate
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            {/* CRM Navigation for mobile */}
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <div className="space-y-2 border-b pb-4 mb-4">
                <h3 className="font-semibold text-gray-900">CRM</h3>
                {crmNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
            
            <Link to="/services" className="block text-gray-700 hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Services
            </Link>
            <Link to="/gallery" className="block text-gray-700 hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Gallery
            </Link>
            <Link to="/reviews" className="block text-gray-700 hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Reviews
            </Link>
            <Link to="/about" className="block text-gray-700 hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
            <Link to="/contact" className="block text-gray-700 hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
            
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              {user ? (
                <>
                  <Button variant="outline" onClick={handleAuthClick} className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    {user.role === 'admin' ? 'CRM Dashboard' : user.role === 'staff' ? 'Staff Portal' : 'My Projects'}
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                    Logout
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleAuthClick} className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
              <Button className="bg-secondary text-primary hover:bg-secondary/90 font-semibold">
                Get Free Estimate
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
