
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  CreditCard,
  DollarSign,
  Clock,
  Target
} from 'lucide-react';
import { useConversionMetrics } from '@/hooks/useConversionMetrics';

const ConversionMetrics = () => {
  const { metrics, loading } = useConversionMetrics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusColor = (rate: number, type: 'percentage' | 'time' = 'percentage') => {
    if (type === 'time') {
      return rate <= 7 ? 'text-green-600' : rate <= 14 ? 'text-yellow-600' : 'text-red-600';
    }
    return rate >= 70 ? 'text-green-600' : rate >= 40 ? 'text-yellow-600' : 'text-red-600';
  };

  const getStatusIcon = (rate: number, type: 'percentage' | 'time' = 'percentage') => {
    if (type === 'time') {
      return rate <= 7 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
    }
    return rate >= 70 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Conversion Analytics</h2>
        <Badge variant="outline" className="text-sm">
          Live Data
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lead Conversion Rate */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Conversion</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className={getStatusColor(metrics.conversionRate)}>
                {getStatusIcon(metrics.conversionRate)}
              </span>
              <span>{metrics.convertedLeads} of {metrics.totalLeads} leads</span>
            </div>
          </CardContent>
        </Card>

        {/* Estimate Acceptance Rate */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimate Acceptance</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.estimateAcceptanceRate.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className={getStatusColor(metrics.estimateAcceptanceRate)}>
                {getStatusIcon(metrics.estimateAcceptanceRate)}
              </span>
              <span>{metrics.acceptedEstimates} of {metrics.totalEstimates} estimates</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Rate */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.paymentRate.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className={getStatusColor(metrics.paymentRate)}>
                {getStatusIcon(metrics.paymentRate)}
              </span>
              <span>{metrics.paidInvoices} of {metrics.totalInvoices} invoices</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Conversion Time */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageConversionTime.toFixed(1)} days</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className={getStatusColor(metrics.averageConversionTime, 'time')}>
                {getStatusIcon(metrics.averageConversionTime, 'time')}
              </span>
              <span>Lead to customer</span>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Value */}
        <Card className="hover:shadow-md transition-shadow md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Pipeline</span>
                <span className="text-lg font-semibold">${metrics.totalPipelineValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Won Pipeline</span>
                <span className="text-lg font-semibold text-green-600">
                  ${metrics.wonPipelineValue.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${metrics.totalPipelineValue > 0 ? (metrics.wonPipelineValue / metrics.totalPipelineValue) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Lead Value */}
        <Card className="hover:shadow-md transition-shadow md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Lead Value</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.averageLeadValue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Based on {metrics.totalLeads} leads with estimated values
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversionMetrics;
