
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
}

interface EstimateLineItemsDisplayProps {
  estimateId: string;
}

const EstimateLineItemsDisplay: React.FC<EstimateLineItemsDisplayProps> = ({
  estimateId
}) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLineItems();
  }, [estimateId]);

  const loadLineItems = async () => {
    try {
      const { data, error } = await supabase
        .from('estimate_line_items')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLineItems(data || []);
    } catch (error) {
      console.error('Error loading line items:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + Number(item.total), 0);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Line Items
          <Badge variant="secondary" className="ml-2">
            {lineItems.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lineItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No line items found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 pb-2 border-b">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Line Items */}
            {lineItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-start py-3 border-b border-gray-100 last:border-b-0">
                <div className="col-span-6">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-medium">
                    {Number(item.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-medium">
                    ${Number(item.unit_price).toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-semibold">
                    ${Number(item.total).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            {/* Subtotal */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateLineItemsDisplay;
