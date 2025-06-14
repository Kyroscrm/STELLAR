
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  FileText, 
  Receipt, 
  Calendar, 
  Settings,
  Home,
  BarChart3,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { title: 'Dashboard', href: '/admin', icon: Home },
    { title: 'Leads', href: '/admin/leads', icon: UserPlus },
    { title: 'Customers', href: '/admin/customers', icon: Users },
    { title: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { title: 'Tasks', href: '/admin/tasks', icon: Calendar },
    { title: 'Estimates', href: '/admin/estimates', icon: FileText },
    { title: 'Invoices', href: '/admin/invoices', icon: Receipt },
    { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { title: 'Integrations', href: '/admin/integrations', icon: Settings },
    { title: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/f6ae6373-2ac3-4ff4-8436-389ab0da2914.png" 
              alt="Logo" 
              className="h-8 w-8"
            />
            <span className="font-bold text-primary">Final Roofing</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors ${
                isActive(item.href) ? 'bg-primary/10 text-primary border-r-2 border-primary' : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-primary">
              View Public Site
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
