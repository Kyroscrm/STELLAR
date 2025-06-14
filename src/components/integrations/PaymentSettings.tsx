
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, Settings } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

const PaymentSettings = () => {
  const { paymentMethods, loading, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } = usePaymentMethods();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'stripe' as const,
    provider_id: '',
    is_default: false,
    metadata: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createPaymentMethod(formData);
    if (result) {
      setShowAddForm(false);
      setFormData({ type: 'stripe', provider_id: '', is_default: false, metadata: {} });
    }
  };

  const handleSetDefault = async (id: string) => {
    // First set all to non-default
    for (const method of paymentMethods) {
      if (method.is_default && method.id !== id) {
        await updatePaymentMethod(method.id, { is_default: false });
      }
    }
    // Then set the selected one as default
    await updatePaymentMethod(id, { is_default: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment Gateway Settings</h2>
          <p className="text-gray-600">Manage your payment processing methods</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {/* Add Payment Method Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Payment Provider</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="ach">ACH</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="provider_id">Provider ID / Key</Label>
                  <Input
                    id="provider_id"
                    value={formData.provider_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider_id: e.target.value }))}
                    placeholder="Enter provider ID or API key"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                />
                <Label>Set as default payment method</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Payment Method</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading payment methods...</div>
            </CardContent>
          </Card>
        ) : paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No payment methods configured</p>
                <p className="text-sm">Add a payment method to start processing payments</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{method.type}</span>
                        {method.is_default && <Badge variant="secondary">Default</Badge>}
                      </div>
                      <p className="text-sm text-gray-500">
                        Provider ID: {method.provider_id?.substring(0, 20)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePaymentMethod(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payment Processing Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payment Processing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Test Mode</p>
              <p className="text-sm text-gray-500">Use test API keys for development</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-capture Payments</p>
              <p className="text-sm text-gray-500">Automatically capture authorized payments</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Receipts</p>
              <p className="text-sm text-gray-500">Send email receipts to customers</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettings;
