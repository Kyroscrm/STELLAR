
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PaymentSettings from '@/components/integrations/PaymentSettings';
import ESignatureSetup from '@/components/integrations/ESignatureSetup';
import CalendarSyncSettings from '@/components/integrations/CalendarSyncSettings';
import { 
  CreditCard, 
  FileText, 
  Calendar, 
  Calculator,
  BarChart,
  Workflow,
  Mail,
  Globe,
  Settings,
  Database,
  Languages,
  Smartphone,
  QrCode,
  Brain,
  Layout
} from 'lucide-react';

const IntegrationsPage = () => {
  const [activeTab, setActiveTab] = useState('payments');

  const integrationTabs = [
    { id: 'payments', label: 'Payments', icon: CreditCard, component: PaymentSettings, priority: 'High' },
    { id: 'documents', label: 'E-Signature', icon: FileText, component: ESignatureSetup, priority: 'High' },
    { id: 'calendar', label: 'Calendar Sync', icon: Calendar, component: CalendarSyncSettings, priority: 'High' },
    { id: 'accounting', label: 'Accounting', icon: Calculator, component: () => <ComingSoonCard title="Accounting Integration" />, priority: 'Medium' },
    { id: 'analytics', label: 'Analytics', icon: BarChart, component: () => <ComingSoonCard title="Advanced Analytics" />, priority: 'Medium' },
    { id: 'workflows', label: 'Workflows', icon: Workflow, component: () => <ComingSoonCard title="Workflow Automation" />, priority: 'Medium' },
    { id: 'marketing', label: 'Marketing', icon: Mail, component: () => <ComingSoonCard title="Marketing Automation" />, priority: 'Medium' },
    { id: 'api', label: 'API & Webhooks', icon: Globe, component: () => <ComingSoonCard title="API & Webhooks" />, priority: 'Low' },
    { id: 'social', label: 'Social Media', icon: Globe, component: () => <ComingSoonCard title="Social Media Integration" />, priority: 'Low' },
    { id: 'branding', label: 'Branding', icon: Settings, component: () => <ComingSoonCard title="Multi-tenancy & Branding" />, priority: 'Low' },
    { id: 'backup', label: 'Backup', icon: Database, component: () => <ComingSoonCard title="Backup & Recovery" />, priority: 'Low' },
    { id: 'localization', label: 'Localization', icon: Languages, component: () => <ComingSoonCard title="Multi-language Support" />, priority: 'Low' },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, component: () => <ComingSoonCard title="Mobile Features" />, priority: 'Low' },
    { id: 'scanning', label: 'Scanning', icon: QrCode, component: () => <ComingSoonCard title="Barcode/QR Scanning" />, priority: 'Low' },
    { id: 'ai', label: 'AI Features', icon: Brain, component: () => <ComingSoonCard title="AI & Smart Features" />, priority: 'Low' },
    { id: 'dashboard', label: 'Dashboard', icon: Layout, component: () => <ComingSoonCard title="Custom Dashboard Builder" />, priority: 'Low' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Integrations</h1>
        <p className="text-gray-600">Manage all your CRM integrations and advanced features</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-2">
          {integrationTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 p-3 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-xs text-center">{tab.label}</span>
                <Badge variant="outline" className={`text-xs ${getPriorityColor(tab.priority)}`}>
                  {tab.priority}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {integrationTabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id}>
              <Component />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

// Coming Soon placeholder component
const ComingSoonCard = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
        <p className="text-gray-500">
          This integration is currently in development and will be available in a future update.
        </p>
        <Badge variant="outline" className="mt-4">In Development</Badge>
      </div>
    </CardContent>
  </Card>
);

export default IntegrationsPage;
