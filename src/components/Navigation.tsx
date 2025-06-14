
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Briefcase,
  FileText,
  Calendar,
  DollarSign,
  Settings,
  Home,
  UserPlus,
  ClipboardList,
  Receipt,
  Activity,
  Search,
  Bell,
  ChevronDown,
  LogOut
} from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path) && (path !== '/admin' || location.pathname === '/admin');


  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      title: 'Leads',
      icon: UserPlus,
      basePath: '/admin/leads',
      children: [
        { title: 'All Leads', href: '/admin/leads', description: 'Manage all leads' },
        { title: 'New Lead', href: '/admin/leads/new', description: 'Create new lead' },
        { title: 'Lead Sources', href: '/admin/leads/sources', description: 'Manage lead sources' },
        { title: 'Lead Scoring', href: '/admin/leads/scoring', description: 'Lead scoring rules' }
      ]
    },
    {
      title: 'Customers',
      icon: Users,
      basePath: '/admin/customers',
      children: [
        { title: 'All Customers', href: '/admin/customers', description: 'Manage customers' },
        { title: 'New Customer', href: '/admin/customers/new', description: 'Add new customer' },
        { title: 'Customer Portal', href: '/admin/customers/portal', description: 'Customer access' }
      ]
    },
    {
      title: 'Jobs',
      icon: Briefcase,
      basePath: '/admin/jobs',
      children: [
        { title: 'All Jobs', href: '/admin/jobs', description: 'View all jobs' },
        { title: 'New Job', href: '/admin/jobs/new', description: 'Create new job' },
        { title: 'Job Calendar', href: '/admin/jobs/calendar', description: 'Schedule jobs' },
        { title: 'Job Templates', href: '/admin/jobs/templates', description: 'Job templates' }
      ]
    },
    {
      title: 'Tasks',
      icon: ClipboardList,
      basePath: '/admin/tasks',
      children: [
        { title: 'All Tasks', href: '/admin/tasks', description: 'Manage tasks' },
        { title: 'My Tasks', href: '/admin/tasks/my', description: 'Your assigned tasks' },
        { title: 'Task Board', href: '/admin/tasks/board', description: 'Kanban view' }
      ]
    },
    {
      title: 'Estimates',
      icon: FileText,
      basePath: '/admin/estimates',
      children: [
        { title: 'All Estimates', href: '/admin/estimates', description: 'View estimates' },
        { title: 'New Estimate', href: '/admin/estimates/new', description: 'Create estimate' },
        { title: 'Templates', href: '/admin/estimates/templates', description: 'Estimate templates' }
      ]
    },
    {
      title: 'Invoices',
      icon: Receipt,
      basePath: '/admin/invoices',
      children: [
        { title: 'All Invoices', href: '/admin/invoices', description: 'View invoices' },
        { title: 'New Invoice', href: '/admin/invoices/new', description: 'Create invoice' },
        { title: 'Payments', href: '/admin/invoices/payments', description: 'Payment tracking' },
        { title: 'Recurring', href: '/admin/invoices/recurring', description: 'Recurring invoices' }
      ]
    },
    {
      title: 'Calendar',
      href: '/admin/calendar',
      icon: Calendar,
      description: 'Schedule and appointments',
      basePath: '/admin/calendar',
    },
    {
      title: 'Reports',
      icon: Activity,
      basePath: '/admin/reports',
      children: [
        { title: 'Revenue Report', href: '/admin/reports/revenue', description: 'Revenue analytics' },
        { title: 'Job Performance', href: '/admin/reports/jobs', description: 'Job metrics' },
        { title: 'Lead Conversion', href: '/admin/reports/leads', description: 'Lead analytics' },
        { title: 'Custom Reports', href: '/admin/reports/custom', description: 'Build custom reports' }
      ]
    }
  ];

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/admin" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary">
                Final<span className="text-secondary">Roofing</span>
              </h1>
            </Link>

            {/* Navigation Menu */}
            <div className="hidden md:ml-8 md:flex md:items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {navigationItems.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      {item.children ? (
                        <>
                          <NavigationMenuTrigger 
                            className={`${isActive(item.basePath || item.href || '') ? 'bg-primary/10 text-primary' : ''}`}
                          >
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.title}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <div className="w-[400px] p-4"> {/* Adjusted width */}
                              <ul className="grid gap-3"> {/* Changed to ul for semantic list */}
                                {item.children.map((child) => (
                                  <li key={child.href}> {/* Added li for list items */}
                                    <NavigationMenuLink asChild>
                                      <Link
                                        to={child.href}
                                        className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                          isActive(child.href) ? 'bg-primary/10 text-primary' : ''
                                        }`}
                                      >
                                        <div className="text-sm font-medium leading-none">{child.title}</div>
                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                          {child.description}
                                        </p>
                                      </Link>
                                    </NavigationMenuLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.href!}
                            className={`group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                              isActive(item.href!) ? 'bg-primary/10 text-primary' : ''
                            }`}
                          >
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.title}
                          </Link>
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>

            {/* User menu */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {user?.user_metadata?.full_name || user?.email}
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - simplified for now */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigationItems.map((item) => (
            item.href ? (
              <Link
                key={item.title}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href) 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-4 w-4 inline mr-2" />
                {item.title}
              </Link>
            ) : (
              // Basic dropdown for mobile, can be enhanced
              <details key={item.title} className="group">
                <summary className={`flex items-center justify-between px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                  isActive(item.basePath || '')
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                  <span>
                    <item.icon className="h-4 w-4 inline mr-2" />
                    {item.title}
                  </span>
                  <ChevronDown className="h-4 w-4 transform group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pl-6 space-y-1">
                  {item.children?.map(child => (
                     <Link
                      key={child.href}
                      to={child.href}
                      className={`block px-3 py-2 rounded-md text-sm font-medium ${
                        isActive(child.href) 
                          ? 'bg-primary/80 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              </details>
            )
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
