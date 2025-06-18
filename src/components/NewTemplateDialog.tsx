
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, FileText } from 'lucide-react';
import { useEstimateTemplates, EstimateTemplate } from '@/hooks/useEstimateTemplates';
import { toast } from 'sonner';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  tax_rate: z.number().min(0).max(1),
  terms: z.string().optional(),
  notes: z.string().optional(),
  line_items: z.array(z.any()).default([])
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface NewTemplateDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const NewTemplateDialog: React.FC<NewTemplateDialogProps> = ({ 
  trigger,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTemplate } = useEstimateTemplates();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      tax_rate: 0.08,
      terms: '',
      notes: '',
      line_items: [] // Ensure this is an empty array, not undefined
    },
  });

  const handleSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    try {
      // Ensure the data matches the EstimateTemplate type requirements
      const templateData: Omit<EstimateTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        name: data.name, // Required field
        description: data.description || null,
        tax_rate: data.tax_rate,
        terms: data.terms || null,
        notes: data.notes || null,
        line_items: data.line_items || [] // Ensure it's always an array
      };
      
      const result = await createTemplate(templateData);
      
      if (result) {
        setOpen(false);
        form.reset();
        onSuccess?.();
        toast.success('Template created successfully');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
  };

  const defaultTrigger = (
    <Button variant="outline">
      <Plus className="h-4 w-4 mr-2" />
      New Template
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Estimate Template
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Basic Roofing Estimate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of this template"
                      {...field} 
                    />
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
                  <FormLabel>Default Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="8.0"
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
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Payment due within 30 days"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., All materials included in estimate"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Template'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTemplateDialog;
