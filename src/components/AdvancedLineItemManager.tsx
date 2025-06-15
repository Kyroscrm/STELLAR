import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Copy, 
  Package, 
  Calculator,
  Percent,
  DollarSign,
  Clock
} from 'lucide-react';
import { useEstimateLineItems, EstimateLineItem } from '@/hooks/useEstimateLineItems';
import { toast } from 'sonner';

interface AdvancedLineItemManagerProps {
  estimateId: string;
  onTotalChange?: (total: number) => void;
}

interface LineItemTemplate {
  id: string;
  name: string;
  description: string;
  unit_price: number;
}

const AdvancedLineItemManager: React.FC<AdvancedLineItemManagerProps> = ({
  estimateId,
  onTotalChange
}) => {
  const { lineItems, loading, addLineItem, updateLineItem, deleteLineItem } = useEstimateLineItems(estimateId);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);

  // Sample templates - in a real app, these would come from a database
  const [templates] = useState<LineItemTemplate[]>([
    {
      id: '1',
      name: 'Basic Consultation',
      description: 'Initial consultation and assessment',
      unit_price: 150
    },
    {
      id: '2',
      name: 'Material Package A',
      description: 'Standard material package including tools and supplies',
      unit_price: 500
    },
    {
      id: '3',
      name: 'Labor - Skilled Technician',
      description: 'Hourly rate for skilled technical work',
      unit_price: 85
    }
  ]);

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unit_price: 0
  });

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return subtotal * (discountValue / 100);
    }
    return discountValue;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const total = subtotal - discount;
    onTotalChange?.(total);
    return total;
  };

  const handleAddItem = async () => {
    if (!newItem.description.trim()) {
      toast.error('Description is required');
      return;
    }

    const result = await addLineItem(newItem);
    if (result) {
      setNewItem({ description: '', quantity: 1, unit_price: 0 });
      toast.success('Line item added');
    }
  };

  const handleAddFromTemplate = async (template: LineItemTemplate) => {
    const result = await addLineItem({
      description: template.description,
      quantity: 1,
      unit_price: template.unit_price
    });
    
    if (result) {
      toast.success(`Added ${template.name} to estimate`);
    }
  };

  const handleDuplicateItem = async (item: EstimateLineItem) => {
    const result = await addLineItem({
      description: `${item.description} (Copy)`,
      quantity: item.quantity,
      unit_price: item.unit_price
    });
    
    if (result) {
      toast.success('Line item duplicated');
    }
  };

  const handleBulkUpdate = (field: string, value: any) => {
    lineItems.forEach(item => {
      updateLineItem(item.id, { [field]: value });
    });
    toast.success('Bulk update applied');
  };

  React.useEffect(() => {
    calculateTotal();
  }, [lineItems, discountValue, discountType]);

  if (loading) {
    return <div className="animate-pulse">Loading line items...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Line Items
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              Templates
            </Button>
            <Badge variant="outline" className="text-lg">
              Total: ${calculateTotal().toFixed(2)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Templates Panel */}
        {showTemplates && (
          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Add Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFromTemplate(template)}
                    className="justify-start"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500">${template.unit_price}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Line Items Table */}
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-3 py-2 bg-gray-50 rounded">
            <div className="col-span-1"></div>
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Existing Line Items */}
          {lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg hover:bg-gray-50">
              <div className="col-span-1 flex justify-center">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              </div>
              <div className="col-span-5">
                <Textarea
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                  className="min-h-[60px]"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, { quantity: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateLineItem(item.id, { unit_price: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-1">
                <div className="text-sm font-medium text-right">
                  ${(item.total || 0).toFixed(2)}
                </div>
              </div>
              <div className="col-span-1 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicateItem(item)}
                  title="Duplicate"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteLineItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add New Item Form */}
          <div className="grid grid-cols-12 gap-2 items-center p-3 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="col-span-1"></div>
            <div className="col-span-5">
              <Textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Enter item description..."
                className="min-h-[60px]"
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                placeholder="Qty"
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                value={newItem.unit_price}
                onChange={(e) => setNewItem({ ...newItem, unit_price: Number(e.target.value) })}
                placeholder="Price"
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-span-1">
              <div className="text-sm font-medium text-right">
                ${(newItem.quantity * newItem.unit_price).toFixed(2)}
              </div>
            </div>
            <div className="col-span-1">
              <Button
                size="sm"
                onClick={handleAddItem}
                disabled={!newItem.description.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="border-t pt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Subtotal:</span>
              <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
            </div>
            
            {/* Discount Section */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm">Discount:</span>
              <div className="flex items-center gap-2">
                <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed">$</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-20"
                  min="0"
                  step="0.01"
                />
                <span className="text-sm font-medium w-16 text-right">
                  -${calculateDiscount().toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {lineItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Bulk actions:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdate('quantity', 1)}
              >
                Reset Qty to 1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const avgPrice = calculateSubtotal() / lineItems.length;
                  handleBulkUpdate('unit_price', Math.round(avgPrice * 100) / 100);
                }}
              >
                Normalize Prices
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedLineItemManager;
