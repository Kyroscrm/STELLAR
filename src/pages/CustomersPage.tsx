import React, { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import ViewCustomerDialog from '@/components/ViewCustomerDialog';
import EditCustomerDialog from '@/components/EditCustomerDialog';
import CreateEstimateFromCustomerDialog from '@/components/CreateEstimateFromCustomerDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CustomersPage = () => {
  const { customers, loading, updateCustomer, deleteCustomer, fetchCustomers } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.company_name && customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const customerStats = {
    total: customers.length,
    withEmail: customers.filter(c => c.email).length,
    withPhone: customers.filter(c => c.phone).length,
    withAddress: customers.filter(c => c.address).length,
    withCompany: customers.filter(c => c.company_name).length
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(id);
    }
  };

  const handleEditSuccess = () => {
    fetchCustomers(); // Refresh the customers list
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <Mail className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Email</p>
                <p className="text-2xl font-bold">{customerStats.withEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Phone</p>
                <p className="text-2xl font-bold">{customerStats.withPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Address</p>
                <p className="text-2xl font-bold">{customerStats.withAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Company</p>
                <p className="text-2xl font-bold">{customerStats.withCompany}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
          More Filters
        </Button>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {customer.first_name} {customer.last_name}
                  </CardTitle>
                  {customer.company_name && (
                    <p className="text-gray-600 text-sm mt-1">{customer.company_name}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <ViewCustomerDialog 
                        customer={customer}
                        trigger={<span className="w-full cursor-pointer">View Details</span>}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <EditCustomerDialog 
                        customer={customer} 
                        onSuccess={handleEditSuccess}
                        trigger={<span className="w-full cursor-pointer">Edit Customer</span>}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <CreateEstimateFromCustomerDialog 
                        customer={customer}
                        onSuccess={fetchCustomers}
                        trigger={<span className="w-full cursor-pointer">Create Estimate</span>}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem>Create Invoice</DropdownMenuItem>
                    <DropdownMenuItem>View History</DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteCustomer(customer.id)}
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
                  </div>
                )}
                {customer.emergency_contact_name && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    Emergency: {customer.emergency_contact_name}
                    {customer.emergency_contact_phone && ` • ${customer.emergency_contact_phone}`}
                  </div>
                )}
                {customer.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                    {customer.notes.substring(0, 100)}
                    {customer.notes.length > 100 && '...'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No customers found matching your criteria.</p>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Customer
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
