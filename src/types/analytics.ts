export interface AnalyticsData {
  // Revenue Metrics
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  revenueGrowthRate: number;

  // Conversion Metrics
  leadToCustomerRate: number;
  estimateToInvoiceRate: number;
  invoiceToPaymentRate: number;

  // Pipeline Metrics
  totalPipelineValue: number;
  wonPipelineValue: number;
  activePipelineValue: number;
  pipelineVelocity: number; // days to close

  // Forecasting
  projectedMonthlyRevenue: number;
  projectedQuarterlyRevenue: number;

  // Time-based data for charts
  monthlyRevenueData: Array<{ month: string; revenue: number; }>;
  quarterlyRevenueData: Array<{ quarter: string; revenue: number; }>;
}

export interface ConversionMetric {
  title: string;
  rate: number;
  icon: React.ReactNode;
  subtitle: string;
}

export interface PipelineMetric {
  label: string;
  value: number;
  color?: string;
}

export interface RevenueMetric {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle: string;
  trend?: 'up' | 'down';
}
