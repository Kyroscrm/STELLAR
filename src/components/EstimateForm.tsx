
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCustomers } from '@/hooks/useCustomers';
import { useJobs } from '@/hooks/useJobs';
import { EstimateWithLineItems } from '@/hooks/useEstimates';
import { estimateSchema, EstimateFormData } from '@/lib/validation';

interface EstimateFormProps {
  onSubmit: (data: EstimateFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<EstimateWithLineItems>;
  isSubmitting?: boolean;
}

const EstimateForm: React.FC<EstimateFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false
}) => {
  const { customers } = useCustomers();
  const { jobs } = useJobs();

  const form = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      estimate_number: initialData?.estimate_number || `EST-${Date.now()}`,
      customer_id: initialData?.customer_id || '',
      job_id: initialData?.job_id || '',
      valid_until: initialData?.valid_until || '',
      tax_rate: initialData?.tax_rate || 0,
      status: (initialData?.status as any) || 'draft',
      notes: initialData?.notes || '',
      terms: initialData?.terms || '',
    },
  });

  const handleSubmit = async (data: EstimateFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting estimate:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter estimate title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimate_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimate Number *</FormLabel>
                <FormControl>
                  <Input placeholder="EST-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter estimate description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="job_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="valid_until"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Until</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Rate (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) / 100)}
                    value={field.value ? (field.value * 100).toString() : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms & Conditions</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter terms and conditions" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Estimate'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EstimateForm;
