
import React, { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Building,
  Users,
  Calendar,
  Briefcase
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CustomersPage = () => {
  const { customers, loading, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer => {
    return !searchTerm || 
      `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm)) ||
      (customer.company_name && customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const customerStats = {
    total: customers.length,
    withJobs: customers.filter(c => c.company_name).length, // Approximation
    thisMonth: customers.filter(c => {
      const createdAt = new Date(c.created_at || '');
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{customerStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Business Customers</p>
                <p className="text-2xl font-bold">{customerStats.withJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold">{customerStats.thisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search customers..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {customer.first_name} {customer.last_name}
                  </CardTitle>
                  {customer.company_name && (
                    <Badge variant="outline" className="mt-1">
                      {customer.company_name}
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Create Job</DropdownMenuItem>
                    <DropdownMenuItem>Send Message</DropdownMenuItem>
                    <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => deleteCustomer(customer.id)}
                    >
                      Delete Customer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {customer.email}
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {customer.phone}
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {customer.address}
                    {customer.city && `, ${customer.city}`}
                    {customer.state && `, ${customer.state}`}
                    {customer.zip_code && ` ${customer.zip_code}`}
                  </div>
                )}
                {customer.company_name && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {customer.company_name}
                  </div>
                )}
                {customer.emergency_contact_name && (
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <p className="font-medium">Emergency Contact:</p>
                    <p>{customer.emergency_contact_name}</p>
                    {customer.emergency_contact_phone && (
                      <p>{customer.emergency_contact_phone}</p>
                    )}
                  </div>
                )}
                {customer.notes && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {customer.notes}
                  </p>
                )}
                <div className="text-xs text-gray-400">
                  Customer since {new Date(customer.created_at || '').toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No customers found matching your search.</p>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Customer
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
