
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Save, 
  Star, 
  X,
  Filter,
  Clock
} from 'lucide-react';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  metadata?: any;
}

const EnhancedGlobalSearch: React.FC = () => {
  const { user } = useAuth();
  const { searches, createSearch, deleteSearch } = useSavedSearches();
  const [query, setQuery] = useState('');
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>(['all']);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  const entityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'customers', label: 'Customers' },
    { value: 'leads', label: 'Leads' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'estimates', label: 'Estimates' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'tasks', label: 'Tasks' }
  ];

  const searchEntities = async (searchQuery: string, types: string[]) => {
    if (!user || !searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);

      // Search customers
      if (types.includes('all') || types.includes('customers')) {
        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select('id, first_name, last_name, email, company_name')
          .eq('user_id', user.id)
          .limit(10);

        if (!customersError && customers) {
          customers.forEach(customer => {
            const searchableText = `${customer.first_name} ${customer.last_name} ${customer.email} ${customer.company_name}`.toLowerCase();
            if (searchTerms.some(term => searchableText.includes(term))) {
              searchResults.push({
                id: customer.id,
                type: 'customer',
                title: `${customer.first_name} ${customer.last_name}`,
                subtitle: customer.email || customer.company_name,
                metadata: customer
              });
            }
          });
        }
      }

      // Search leads
      if (types.includes('all') || types.includes('leads')) {
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('id, first_name, last_name, email, status')
          .eq('user_id', user.id)
          .limit(10);

        if (!leadsError && leads) {
          leads.forEach(lead => {
            const searchableText = `${lead.first_name} ${lead.last_name} ${lead.email}`.toLowerCase();
            if (searchTerms.some(term => searchableText.includes(term))) {
              searchResults.push({
                id: lead.id,
                type: 'lead',
                title: `${lead.first_name} ${lead.last_name}`,
                subtitle: `${lead.status} • ${lead.email}`,
                metadata: lead
              });
            }
          });
        }
      }

      // Search jobs
      if (types.includes('all') || types.includes('jobs')) {
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, description, status')
          .eq('user_id', user.id)
          .limit(10);

        if (!jobsError && jobs) {
          jobs.forEach(job => {
            const searchableText = `${job.title} ${job.description}`.toLowerCase();
            if (searchTerms.some(term => searchableText.includes(term))) {
              searchResults.push({
                id: job.id,
                type: 'job',
                title: job.title,
                subtitle: `${job.status} • ${job.description?.substring(0, 50)}...`,
                metadata: job
              });
            }
          });
        }
      }

      // Search estimates
      if (types.includes('all') || types.includes('estimates')) {
        const { data: estimates, error: estimatesError } = await supabase
          .from('estimates')
          .select('id, estimate_number, title, status, total_amount')
          .eq('user_id', user.id)
          .limit(10);

        if (!estimatesError && estimates) {
          estimates.forEach(estimate => {
            const searchableText = `${estimate.estimate_number} ${estimate.title}`.toLowerCase();
            if (searchTerms.some(term => searchableText.includes(term))) {
              searchResults.push({
                id: estimate.id,
                type: 'estimate',
                title: `${estimate.estimate_number} - ${estimate.title}`,
                subtitle: `${estimate.status} • $${estimate.total_amount}`,
                metadata: estimate
              });
            }
          });
        }
      }

      // Search invoices
      if (types.includes('all') || types.includes('invoices')) {
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('id, invoice_number, title, status, total_amount')
          .eq('user_id', user.id)
          .limit(10);

        if (!invoicesError && invoices) {
          invoices.forEach(invoice => {
            const searchableText = `${invoice.invoice_number} ${invoice.title}`.toLowerCase();
            if (searchTerms.some(term => searchableText.includes(term))) {
              searchResults.push({
                id: invoice.id,
                type: 'invoice',
                title: `${invoice.invoice_number} - ${invoice.title}`,
                subtitle: `${invoice.status} • $${invoice.total_amount}`,
                metadata: invoice
              });
            }
          });
        }
      }

      // Search tasks
      if (types.includes('all') || types.includes('tasks')) {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title, description, status, priority')
          .eq('user_id', user.id)
          .limit(10);

        if (!tasksError && tasks) {
          tasks.forEach(task => {
            const searchableText = `${task.title} ${task.description}`.toLowerCase();
            if (searchTerms.some(term => searchableText.includes(term))) {
              searchResults.push({
                id: task.id,
                type: 'task',
                title: task.title,
                subtitle: `${task.status} • ${task.priority} priority`,
                metadata: task
              });
            }
          });
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchEntities(query, selectedEntityTypes);
  };

  const handleSaveSearch = async () => {
    if (!saveName.trim()) return;

    const result = await createSearch({
      name: saveName,
      query,
      filters: {},
      entity_types: selectedEntityTypes
    });

    if (result) {
      setShowSaveDialog(false);
      setSaveName('');
    }
  };

  const loadSavedSearch = (search: any) => {
    setQuery(search.query);
    setSelectedEntityTypes(search.entity_types);
    searchEntities(search.query, search.entity_types);
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      customer: '👤',
      lead: '🎯',
      job: '🔨',
      estimate: '📄',
      invoice: '💰',
      task: '✅'
    };
    return icons[type] || '📋';
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length > 2) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedEntityTypes]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Enhanced Global Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Search across all data..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            value={selectedEntityTypes[0] || 'all'}
            onValueChange={(value) => setSelectedEntityTypes([value])}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entityTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Save Search */}
        {query && (
          <div className="flex items-center gap-2">
            {showSaveDialog ? (
              <>
                <Input
                  placeholder="Search name..."
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveSearch} size="sm">
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSaveDialog(false)}
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(true)}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Search
              </Button>
            )}
          </div>
        )}

        {/* Saved Searches */}
        {searches.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Saved Searches</h4>
            <div className="flex flex-wrap gap-2">
              {searches.slice(0, 5).map(search => (
                <Badge
                  key={search.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 flex items-center gap-1"
                  onClick={() => loadSavedSearch(search)}
                >
                  <Star className="h-3 w-3" />
                  {search.name}
                  <X 
                    className="h-3 w-3 ml-1 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSearch(search.id);
                    }}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Search Results ({results.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map(result => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getTypeIcon(result.type)}</span>
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-gray-500">{result.subtitle}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {result.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No results found for "{query}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedGlobalSearch;
