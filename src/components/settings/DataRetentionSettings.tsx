import React from 'react';
import { useDataRetention } from '@/hooks/useDataRetention';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Trash2 } from 'lucide-react';
import { DataRetentionPolicy } from '@/hooks/useDataRetention';

const policySchema = z.object({
  table_name: z.string().min(1, 'Table name is required'),
  retention_period_days: z.number().min(1, 'Retention period must be at least 1 day'),
  policy_type: z.enum(['automatic', 'manual', 'legal_hold']),
  compliance_requirement: z.string().nullable(),
  auto_delete: z.boolean()
}).required();

type PolicyFormValues = z.infer<typeof policySchema>;

export function DataRetentionSettings() {
  const {
    policies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    generateRetentionReport,
    scheduleAutomaticCleanup,
    isLoading,
    error
  } = useDataRetention();

  const { toast } = useToast();
  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      table_name: '',
      retention_period_days: 30,
      policy_type: 'automatic',
      compliance_requirement: null,
      auto_delete: false
    }
  });

  const onSubmit = async (values: PolicyFormValues) => {
    try {
      const policyData: Omit<DataRetentionPolicy, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
        table_name: values.table_name,
        retention_period_days: values.retention_period_days,
        policy_type: values.policy_type,
        compliance_requirement: values.compliance_requirement,
        auto_delete: values.auto_delete
      };
      await createPolicy(policyData);
      form.reset();
      toast({
        title: 'Success',
        description: 'Retention policy created successfully',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePolicy(id);
      toast({
        title: 'Success',
        description: 'Retention policy deleted successfully',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await generateRetentionReport();
      toast({
        title: 'Success',
        description: `Generated report for ${report.length} tables`,
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleToggleAutomaticCleanup = async (enabled: boolean) => {
    try {
      await scheduleAutomaticCleanup(enabled);
      toast({
        title: 'Success',
        description: `Automatic cleanup ${enabled ? 'enabled' : 'disabled'} successfully`,
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Retention Policies</CardTitle>
          <CardDescription>
            Configure how long data should be retained before being automatically cleaned up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="table_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table Name</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <option value="leads">Leads</option>
                      <option value="customers">Customers</option>
                      <option value="jobs">Jobs</option>
                      <option value="estimates">Estimates</option>
                      <option value="invoices">Invoices</option>
                      <option value="tasks">Tasks</option>
                      <option value="calendar_events">Calendar Events</option>
                    </Select>
                    <FormDescription>Select the table to apply the retention policy to.</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retention_period_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retention Period (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>Number of days to retain data before cleanup.</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="policy_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                      <option value="legal_hold">Legal Hold</option>
                    </Select>
                    <FormDescription>How the retention policy should be enforced.</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compliance_requirement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compliance Requirement</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., GDPR Article 17" value={field.value || ''} />
                    </FormControl>
                    <FormDescription>Optional: Reference any compliance requirements.</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_delete"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Automatic Deletion</FormLabel>
                      <FormDescription>
                        Automatically delete records when they exceed the retention period.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Policy...
                  </>
                ) : (
                  'Create Policy'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Policies</CardTitle>
          <CardDescription>
            View and manage existing data retention policies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <h4 className="font-medium">{policy.table_name}</h4>
                  <p className="text-sm text-gray-500">
                    {policy.retention_period_days} days | {policy.policy_type}
                  </p>
                  {policy.compliance_requirement && (
                    <p className="text-xs text-gray-400">{policy.compliance_requirement}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={policy.auto_delete}
                    onCheckedChange={(checked) => {
                      updatePolicy(policy.id, { auto_delete: checked });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(policy.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {policies.length === 0 && (
              <p className="text-center text-gray-500">No retention policies found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleGenerateReport}
          disabled={isLoading}
        >
          Generate Report
        </Button>
        <Button
          variant="default"
          onClick={() => handleToggleAutomaticCleanup(true)}
          disabled={isLoading}
        >
          Enable Automatic Cleanup
        </Button>
      </div>
    </div>
  );
}
