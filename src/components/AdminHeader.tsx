import React, { useState } from 'react';
import { User, Menu, X, Briefcase, Users, FileText, Calendar, Receipt, UserPlus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTour } from '@/contexts/TourContext';

const AdminHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { startTour } = useTour();
  const navigate = useNavigate();

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
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-4">
              <img
                src="/lovable-uploads/f6ae6373-2ac3-4ff4-8436-389ab0da2914.png"
                alt="Final Roofing & Retro-Fit Logo"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-heading font-bold text-primary">
                  Final <span className="text-secondary">Roofing</span> CRM
                </h1>
                <p className="text-xs text-gray-600">Customer Relationship Management</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 sidebar-nav">
            {crmNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium text-sm"
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Welcome, {user?.name}</span>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              Logout
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startTour('main')}
              className="help-button"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
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
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {crmNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}

            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
                <User className="h-4 w-4" />
                <span>Welcome, {user?.name}</span>
              </div>
              <Button variant="outline" onClick={handleLogout} className="w-full justify-start">
                Logout
              </Button>
              <Button
                variant="ghost"
                onClick={() => startTour('main')}
                className="w-full justify-start help-button"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Help
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
