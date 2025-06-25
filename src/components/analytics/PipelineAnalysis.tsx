import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp } from 'lucide-react';
import { AnalyticsData, PipelineMetric } from '@/types/analytics';

interface PipelineAnalysisProps {
  analytics: AnalyticsData;
}

const PipelineAnalysis: React.FC<PipelineAnalysisProps> = ({ analytics }) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const pipelineMetrics: PipelineMetric[] = [
    {
      label: 'Total Pipeline',
      value: analytics.totalPipelineValue
    },
    {
      label: 'Won Pipeline',
      value: analytics.wonPipelineValue,
      color: 'text-green-600'
    },
    {
      label: 'Active Pipeline',
      value: analytics.activePipelineValue,
      color: 'text-blue-600'
    }
  ];

  const forecastMetrics: PipelineMetric[] = [
    {
      label: 'Projected Monthly',
      value: analytics.projectedMonthlyRevenue
    },
    {
      label: 'Projected Quarterly',
      value: analytics.projectedQuarterlyRevenue
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Pipeline Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pipelineMetrics.map((metric, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <span className={`text-lg font-semibold ${metric.color || ''}`}>
                {formatCurrency(metric.value)}
              </span>
            </div>
          ))}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{
                width: `${analytics.totalPipelineValue > 0 ? (analytics.wonPipelineValue / analytics.totalPipelineValue) * 100 : 0}%`
              }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Revenue Forecasting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {forecastMetrics.map((metric, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <span className="text-lg font-semibold">{formatCurrency(metric.value)}</span>
            </div>
          ))}
          <div className="text-xs text-muted-foreground">
            Based on current trends and growth rates
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelineAnalysis;
