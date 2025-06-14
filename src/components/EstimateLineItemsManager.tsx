import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useEstimateLineItems, EstimateLineItem } from '@/hooks/useEstimateLineItems';

interface EstimateLineItemsManagerProps {
  estimateId: string;
  onTotalChange?: (total: number) => void;
}

const EstimateLineItemsManager: React.FC<EstimateLineItemsManagerProps> = ({
  estimateId,
  onTotalChange
}) => {
  const { lineItems, loading, addLineItem, updateLineItem, deleteLineItem } = useEstimateLineItems(estimateId);
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unit_price: 0
  });

  const calculateTotal = () => {
    const total = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    onTotalChange?.(total);
    return total;
  };

  const handleAddItem = async () => {
    if (!newItem.description.trim()) return;

    const result = await addLineItem(newItem);
    if (result) {
      setNewItem({ description: '', quantity: 1, unit_price: 0 });
    }
  };

  const handleUpdateItem = async (id: string, field: string, value: any) => {
    await updateLineItem(id, { [field]: value });
  };

  React.useEffect(() => {
    calculateTotal();
  }, [lineItems]);

  if (loading) {
    return <div className="animate-pulse">Loading line items...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Line Items
          <Badge variant="outline">
            Total: ${calculateTotal().toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Line Items */}
        {lineItems.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
            <div className="col-span-1 flex justify-center">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            </div>
            <div className="col-span-5">
              <Textarea
                value={item.description}
                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                placeholder="Item description"
                className="min-h-[60px]"
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                placeholder="Qty"
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                value={item.unit_price}
                onChange={(e) => handleUpdateItem(item.id, 'unit_price', Number(e.target.value))}
                placeholder="Price"
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-span-1">
              <div className="text-sm font-medium text-right">
                ${(item.total || 0).toFixed(2)}
              </div>
            </div>
            <div className="col-span-1 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteLineItem(item.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
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
          <div className="col-span-1 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddItem}
              disabled={!newItem.description.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Column Headers */}
        {lineItems.length === 0 && (
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-3">
            <div className="col-span-1"></div>
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-1"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateLineItemsManager;
