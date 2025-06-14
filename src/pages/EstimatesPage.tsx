
import React, { useState } from 'react';
import { useEstimates } from '@/hooks/useEstimates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  FileText,
  DollarSign,
  CheckCircle,
  Eye,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EstimatesPage = () => {
  const { estimates, loading, error } // Add updateEstimate, deleteEstimate when implemented
    = useEstimates();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEstimates = estimates.filter(estimate => 
    estimate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.estimate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (estimate.customers && `${estimate.customers.first_name} ${estimate.customers.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const estimateStats = {
    total: estimates.length,
    draft: estimates.filter(e => e.status === 'draft').length,
    sent: estimates.filter(e => e.status === 'sent').length,
    approved: estimates.filter(e => e.status === 'approved').length,
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <AlertTriangle className="mx-auto h-12 w-12" />
        <p className="mt-4 text-lg">Error loading estimates: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estimates</h1>
          <p className="text-gray-600">Create and manage project estimates</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Estimate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Estimates</p>
                <p className="text-2xl font-bold">{estimateStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold">{estimateStats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold">{estimateStats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{estimateStats.approved}</p>
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
            placeholder="Search estimates by title or number..." 
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

      {/* Estimates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estimate List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell className="font-medium">{estimate.estimate_number}</TableCell>
                  <TableCell>{estimate.title}</TableCell>
                  <TableCell>
                    {estimate.customers ? 
                      `${estimate.customers.first_name} ${estimate.customers.last_name}` : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      estimate.status === 'approved' ? 'default' :
                      estimate.status === 'sent' ? 'secondary' :
                      estimate.status === 'rejected' || estimate.status === 'expired' ? 'destructive' :
                      'outline'
                    } className="capitalize">
                      {estimate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${(estimate.total_amount || 0).toFixed(2)}</TableCell>
                  <TableCell>{estimate.valid_until ? new Date(estimate.valid_until).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Estimate</DropdownMenuItem>
                        <DropdownMenuItem>Convert to Invoice</DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          // onClick={() => deleteEstimate(estimate.id)}
                        >
                          Delete Estimate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredEstimates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No estimates found.</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Estimate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EstimatesPage;
