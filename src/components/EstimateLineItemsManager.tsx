import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useEstimateLineItems } from '@/hooks/useEstimateLineItems';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface EstimateLineItemsManagerProps {
  estimateId: string;
  onTotalChange?: (total: number) => void;
}

const EstimateLineItemsManager: React.FC<EstimateLineItemsManagerProps> = ({
  estimateId,
  onTotalChange
}) => {
  const { lineItems, loading, addLineItem, updateLineItem, deleteLineItem, reorderLineItems } = useEstimateLineItems(estimateId);
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unit_price: 0
  });
  const [isAdding, setIsAdding] = useState(false);

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  React.useEffect(() => {
    const total = calculateTotal();
    onTotalChange?.(total);
  }, [lineItems, onTotalChange]);

  const handleAddItem = async () => {
    if (!newItem.description.trim()) {
      toast.error('Description is required');
      return;
    }

    setIsAdding(true);
    try {
      const result = await addLineItem({
        description: newItem.description.trim(),
        quantity: newItem.quantity || 1,
        unit_price: newItem.unit_price || 0
      });

      if (result) {
        setNewItem({
          description: '',
          quantity: 1,
          unit_price: 0
        });
        toast.success('Line item added successfully');
      }
    } catch (error) {
      toast.error('Failed to add line item');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteLineItem(id);
      toast.success('Line item deleted');
    } catch (error) {
      toast.error('Failed to delete line item');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Reorder items
    const reorderedItems = Array.from(lineItems);
    const [movedItem] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destinationIndex, 0, movedItem);

    // Update sort_order values and call the hook function
    const itemsWithUpdatedOrder = reorderedItems.map((item, index) => ({
      ...item,
      sort_order: index
    }));

    try {
      await reorderLineItems(itemsWithUpdatedOrder);
      toast.success('Line items reordered');
    } catch (error) {
      toast.error('Failed to reorder line items');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading line items...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Line Items
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Total: ${calculateTotal().toFixed(2)}
            </Badge>
          </CardTitle>
          <Button
            onClick={handleAddItem}
            size="sm"
            disabled={!newItem.description.trim() || isAdding}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {isAdding ? 'Adding...' : 'Add Item'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Column Headers */}
        {lineItems.length > 0 && (
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-3 pb-2 border-b">
            <div className="col-span-1"></div>
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-1"></div>
          </div>
        )}

        {/* Existing Line Items */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`estimate-line-items-${estimateId}`}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {lineItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`grid grid-cols-12 gap-2 items-center p-3 border rounded-lg transition-colors ${
                          snapshot.isDragging
                            ? 'bg-blue-50 border-blue-300 shadow-lg'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="col-span-1 flex justify-center cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="col-span-5">
                          <Input
                            value={item.description}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateLineItem(item.id, { description: value }).catch(() => {
                                toast.error('Failed to update description');
                              });
                            }}
                            className="border-0 p-1 h-8"
                            placeholder="Description"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (value >= 0) {
                                updateLineItem(item.id, {
                                  quantity: value,
                                  total: value * item.unit_price
                                }).catch(() => {
                                  toast.error('Failed to update quantity');
                                });
                              }
                            }}
                            className="border-0 p-1 h-8 text-center"
                            min="0"
                            step="1"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (value >= 0) {
                                updateLineItem(item.id, {
                                  unit_price: value,
                                  total: item.quantity * value
                                }).catch(() => {
                                  toast.error('Failed to update price');
                                });
                              }
                            }}
                            className="border-0 p-1 h-8 text-center"
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
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add New Item Form */}
        <div className="grid grid-cols-12 gap-2 items-center p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
          <div className="col-span-1 flex justify-center">
            <Plus className="h-4 w-4 text-gray-400" />
          </div>
          <div className="col-span-5">
            <Textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Enter item description..."
              className="min-h-[60px] resize-none"
              rows={2}
            />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) || 1 })}
              placeholder="Qty"
              min="0"
              step="0.01"
            />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              value={newItem.unit_price}
              onChange={(e) => setNewItem({ ...newItem, unit_price: Number(e.target.value) || 0 })}
              placeholder="Price"
              min="0"
              step="0.01"
            />
          </div>
          <div className="col-span-1">
            <div className="text-sm font-medium text-right text-gray-600">
              ${(newItem.quantity * newItem.unit_price).toFixed(2)}
            </div>
          </div>
          <div className="col-span-1 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddItem}
              disabled={!newItem.description.trim() || isAdding}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Add this item"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {lineItems.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <Plus className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-lg font-medium">No line items yet</p>
              <p className="text-sm">Add your first item using the form above or click "Add Item"</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateLineItemsManager;
