
import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, Briefcase, FileText, Calendar, DollarSign } from 'lucide-react';
import { Input } from './input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { useCustomers } from '@/hooks/useCustomers';
import { useLeads } from '@/hooks/useLeads';
import { useJobs } from '@/hooks/useJobs';
import { useEstimates } from '@/hooks/useEstimates';
import { useInvoices } from '@/hooks/useInvoices';
import { useTasks } from '@/hooks/useTasks';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'customer' | 'lead' | 'job' | 'estimate' | 'invoice' | 'task';
  data: any;
}

const typeIcons = {
  customer: User,
  lead: User,
  job: Briefcase,
  estimate: FileText,
  invoice: DollarSign,
  task: Calendar
};

const typeColors = {
  customer: 'bg-blue-100 text-blue-800',
  lead: 'bg-green-100 text-green-800',
  job: 'bg-purple-100 text-purple-800',
  estimate: 'bg-orange-100 text-orange-800',
  invoice: 'bg-red-100 text-red-800',
  task: 'bg-gray-100 text-gray-800'
};

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const { customers } = useCustomers();
  const { leads } = useLeads();
  const { jobs } = useJobs();
  const { estimates } = useEstimates();
  const { invoices } = useInvoices();
  const { tasks } = useTasks();

  const allData = useMemo(() => {
    const searchableData: SearchResult[] = [];

    // Add customers
    customers.forEach(customer => {
      searchableData.push({
        id: customer.id,
        title: `${customer.first_name} ${customer.last_name}`,
        subtitle: customer.email || customer.phone || customer.company_name,
        type: 'customer',
        data: customer
      });
    });

    // Add leads
    leads.forEach(lead => {
      searchableData.push({
        id: lead.id,
        title: `${lead.first_name} ${lead.last_name}`,
        subtitle: lead.email || lead.phone,
        type: 'lead',
        data: lead
      });
    });

    // Add jobs
    jobs.forEach(job => {
      searchableData.push({
        id: job.id,
        title: job.title,
        subtitle: job.description,
        type: 'job',
        data: job
      });
    });

    // Add estimates
    estimates.forEach(estimate => {
      searchableData.push({
        id: estimate.id,
        title: estimate.title,
        subtitle: estimate.estimate_number,
        type: 'estimate',
        data: estimate
      });
    });

    // Add invoices
    invoices.forEach(invoice => {
      searchableData.push({
        id: invoice.id,
        title: invoice.title,
        subtitle: invoice.invoice_number,
        type: 'invoice',
        data: invoice
      });
    });

    // Add tasks
    tasks.forEach(task => {
      searchableData.push({
        id: task.id,
        title: task.title,
        subtitle: task.description,
        type: 'task',
        data: task
      });
    });

    return searchableData;
  }, [customers, leads, jobs, estimates, invoices, tasks]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = allData.filter(item => {
      const searchText = `${item.title} ${item.subtitle || ''}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    setResults(filtered.slice(0, 20)); // Limit results
  }, [query, allData]);

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the appropriate page based on type
    const routes = {
      customer: '/admin/customers',
      lead: '/admin/leads',
      job: '/admin/jobs',
      estimate: '/admin/estimates',
      invoice: '/admin/invoices',
      task: '/admin/tasks'
    };
    
    console.log(`Navigate to ${routes[result.type]} for ${result.type} ${result.id}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <Search className="mr-2 h-4 w-4" />
          <span>Search everything...</span>
          <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers, leads, jobs, estimates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          
          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result) => {
                const Icon = typeIcons[result.type];
                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className={typeColors[result.type]}>
                      {result.type}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
          
          {query && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No results found for "{query}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
