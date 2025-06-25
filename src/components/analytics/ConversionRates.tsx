import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, PieChart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { AnalyticsData, ConversionMetric } from '@/types/analytics';

interface ConversionRatesProps {
  analytics: AnalyticsData;
}

const ConversionRates: React.FC<ConversionRatesProps> = ({ analytics }) => {
  const formatPercentage = (rate: number) => `${rate.toFixed(1)}%`;

  const getStatusColor = (rate: number) => {
    return rate >= 70 ? 'text-green-600' : rate >= 40 ? 'text-yellow-600' : 'text-red-600';
  };

  const getStatusIcon = (rate: number) => {
    return rate >= 70 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const metrics: ConversionMetric[] = [
    {
      title: 'Lead to Customer',
      rate: analytics.leadToCustomerRate,
      icon: <Target className="h-4 w-4 text-blue-600" />,
      subtitle: 'Conversion rate'
    },
    {
      title: 'Estimate to Invoice',
      rate: analytics.estimateToInvoiceRate,
      icon: <PieChart className="h-4 w-4 text-green-600" />,
      subtitle: 'Acceptance rate'
    },
    {
      title: 'Invoice to Payment',
      rate: analytics.invoiceToPaymentRate,
      icon: <DollarSign className="h-4 w-4 text-purple-600" />,
      subtitle: 'Payment rate'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metric.rate)}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className={getStatusColor(metric.rate)}>
                {getStatusIcon(metric.rate)}
              </span>
              <span>{metric.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConversionRates;
