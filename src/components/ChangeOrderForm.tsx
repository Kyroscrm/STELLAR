import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChangeOrders, type ChangeOrder, type CreateChangeOrderData, type UpdateChangeOrderData } from '@/hooks/useChangeOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const changeOrderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  change_type: z.enum(['addition', 'removal', 'modification', 'scope_change']),
  original_amount: z.number().min(0, 'Original amount must be positive'),
  change_amount: z.number(),
  reason: z.string().min(1, 'Reason is required'),
  labor_hours_change: z.number().optional(),
  material_cost_change: z.number().optional(),
});

type ChangeOrderFormData = z.infer<typeof changeOrderSchema>;

interface ChangeOrderFormProps {
  jobId: string;
  existingChangeOrder?: ChangeOrder;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ChangeOrderForm: React.FC<ChangeOrderFormProps> = ({
  jobId,
  existingChangeOrder,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const { createChangeOrder, updateChangeOrder } = useChangeOrders();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ChangeOrderFormData>({
    resolver: zodResolver(changeOrderSchema),
    defaultValues: {
      title: existingChangeOrder?.title || '',
      description: existingChangeOrder?.description || '',
      change_type: existingChangeOrder?.change_type || 'addition',
      original_amount: existingChangeOrder?.original_amount || 0,
      change_amount: existingChangeOrder?.change_amount || 0,
      reason: existingChangeOrder?.reason || '',
      labor_hours_change: existingChangeOrder?.labor_hours_change || 0,
      material_cost_change: existingChangeOrder?.material_cost_change || 0,
    },
  });

  const onSubmit = async (data: ChangeOrderFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (existingChangeOrder) {
        // Update existing change order
        const updateData: UpdateChangeOrderData = {
          id: existingChangeOrder.id,
          ...data,
        };
        await updateChangeOrder(updateData);
      } else {
        // Create new change order
        const createData: CreateChangeOrderData = {
          job_id: jobId,
          requested_by: user.id,
          title: data.title,
          description: data.description,
          change_type: data.change_type,
          original_amount: data.original_amount,
          change_amount: data.change_amount,
          reason: data.reason,
          labor_hours_change: data.labor_hours_change,
          material_cost_change: data.material_cost_change,
        };
        await createChangeOrder(createData);
      }
      onSuccess?.();
    } catch (error) {
      // Error handling is done by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {existingChangeOrder ? 'Edit Change Order' : 'Create Change Order'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter change order title" />
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
                    <Textarea {...field} placeholder="Describe the changes in detail" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="change_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Change Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select change type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="addition">Addition</SelectItem>
                      <SelectItem value="removal">Removal</SelectItem>
                      <SelectItem value="modification">Modification</SelectItem>
                      <SelectItem value="scope_change">Scope Change</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="original_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Amount ($)</FormLabel>
                    <FormControl>
        <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="change_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Change Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
        />
      </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="labor_hours_change"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Hours Change</FormLabel>
                    <FormControl>
        <Input
          type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="material_cost_change"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Cost Change ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
        />
      </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Change</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Explain why this change is needed" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="flex justify-end space-x-2 px-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : existingChangeOrder ? 'Update' : 'Create'}
        </Button>
            </CardFooter>
    </form>
        </Form>
      </CardContent>
    </Card>
  );
};
