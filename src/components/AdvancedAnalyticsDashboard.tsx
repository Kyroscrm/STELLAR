import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Clock
} from 'lucide-react';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import SuspenseLoader from '@/components/SuspenseLoader';
import { AutoSizer, List } from 'react-window';
import { AnalyticsData, RevenueMetric } from '@/types/analytics';

// Lazy load chart components
const RevenueCharts = React.lazy(() => import('@/components/analytics/RevenueCharts'));
const ConversionRates = React.lazy(() => import('@/components/analytics/ConversionRates'));
const PipelineAnalysis = React.lazy(() => import('@/components/analytics/PipelineAnalysis'));

interface RevenueMetricsProps {
  analytics: AnalyticsData;
}

const RevenueMetrics: React.FC<RevenueMetricsProps> = ({ analytics }) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (rate: number) => `${rate.toFixed(1)}%`;

  const metrics: RevenueMetric[] = [
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics.totalRevenue),
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
      subtitle: 'All time'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(analytics.monthlyRevenue),
      icon: <Calendar className="h-4 w-4 text-blue-600" />,
      subtitle: `${formatPercentage(Math.abs(analytics.revenueGrowthRate))} vs last month`,
      trend: analytics.revenueGrowthRate >= 0 ? 'up' : 'down'
    },
    {
      title: 'Quarterly Revenue',
      value: formatCurrency(analytics.quarterlyRevenue),
      icon: <BarChart3 className="h-4 w-4 text-purple-600" />,
      subtitle: 'Current quarter'
    },
    {
      title: 'Pipeline Velocity',
      value: `${analytics.pipelineVelocity.toFixed(0)} days`,
      icon: <Clock className="h-4 w-4 text-orange-600" />,
      subtitle: 'Average time to close'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {metric.trend && (
                <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {metric.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </span>
              )}
              <span>{metric.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AdvancedAnalyticsDashboard = () => {
  const { analytics, loading } = useAdvancedAnalytics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Analytics Dashboard</h2>
        <Badge variant="outline" className="text-sm">
          Live Data
        </Badge>
      </div>

      {/* Revenue Metrics */}
      <RevenueMetrics analytics={analytics} />

      {/* Conversion Rates */}
      <Suspense fallback={<SuspenseLoader />}>
        <ConversionRates analytics={analytics} />
      </Suspense>

      {/* Pipeline Analysis */}
      <Suspense fallback={<SuspenseLoader />}>
        <PipelineAnalysis analytics={analytics} />
      </Suspense>

      {/* Revenue Charts */}
      <Suspense fallback={<SuspenseLoader />}>
        <RevenueCharts analytics={analytics} />
      </Suspense>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
