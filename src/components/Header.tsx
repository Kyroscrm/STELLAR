
import React, { useState } from 'react';
import { Phone, Mail, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
          <div className="flex items-center">
            <h1 className="text-2xl font-heading font-bold text-primary">
              Final<span className="text-secondary">Roofing</span> & Retro-Fit
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#services" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Services
            </a>
            <a href="#gallery" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Gallery
            </a>
            <a href="#reviews" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Reviews
            </a>
            <a href="#about" className="text-gray-700 hover:text-primary transition-colors font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Contact
            </a>
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
            <a href="#services" className="block text-gray-700 hover:text-primary transition-colors font-medium">
              Services
            </a>
            <a href="#gallery" className="block text-gray-700 hover:text-primary transition-colors font-medium">
              Gallery
            </a>
            <a href="#reviews" className="block text-gray-700 hover:text-primary transition-colors font-medium">
              Reviews
            </a>
            <a href="#about" className="block text-gray-700 hover:text-primary transition-colors font-medium">
              About
            </a>
            <a href="#contact" className="block text-gray-700 hover:text-primary transition-colors font-medium">
              Contact
            </a>
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
