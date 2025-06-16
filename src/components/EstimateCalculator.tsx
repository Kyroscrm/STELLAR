
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

const EstimateCalculator = () => {
  const [formData, setFormData] = useState({
    roofSize: '',
    roofType: 'asphalt',
    stories: '1',
    condition: 'fair'
  });
  const [estimate, setEstimate] = useState<number | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateEstimate = () => {
    const size = parseInt(formData.roofSize) || 0;
    let basePrice = 0;

    // Base pricing per square foot
    switch (formData.roofType) {
      case 'asphalt':
        basePrice = 8;
        break;
      case 'metal':
        basePrice = 12;
        break;
      case 'tile':
        basePrice = 15;
        break;
      case 'slate':
        basePrice = 20;
        break;
      default:
        basePrice = 8;
    }

    // Story multiplier
    const storyMultiplier = formData.stories === '2' ? 1.3 : formData.stories === '3' ? 1.6 : 1;

    // Condition multiplier
    const conditionMultiplier = formData.condition === 'poor' ? 1.4 : formData.condition === 'good' ? 0.9 : 1;

    const total = size * basePrice * storyMultiplier * conditionMultiplier;
    setEstimate(Math.round(total));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Quick Estimate Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="roofSize">Roof Size (sq ft)</Label>
          <Input
            id="roofSize"
            type="number"
            placeholder="Enter square footage"
            value={formData.roofSize}
            onChange={(e) => handleInputChange('roofSize', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="roofType">Roof Material</Label>
          <select
            id="roofType"
            value={formData.roofType}
            onChange={(e) => handleInputChange('roofType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="asphalt">Asphalt Shingles</option>
            <option value="metal">Metal Roofing</option>
            <option value="tile">Tile Roofing</option>
            <option value="slate">Slate Roofing</option>
          </select>
        </div>

        <div>
          <Label htmlFor="stories">Number of Stories</Label>
          <select
            id="stories"
            value={formData.stories}
            onChange={(e) => handleInputChange('stories', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1">1 Story</option>
            <option value="2">2 Stories</option>
            <option value="3">3+ Stories</option>
          </select>
        </div>

        <div>
          <Label htmlFor="condition">Current Roof Condition</Label>
          <select
            id="condition"
            value={formData.condition}
            onChange={(e) => handleInputChange('condition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <Button onClick={calculateEstimate} className="w-full">
          Calculate Estimate
        </Button>

        {estimate && (
          <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ${estimate.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Estimated project cost*
              </div>
              <div className="text-xs text-gray-500 mt-2">
                *This is a rough estimate. Contact us for a detailed quote.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateCalculator;
