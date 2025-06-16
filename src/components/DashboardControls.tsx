
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  BarChart3,
  Shield, 
  Activity, 
  Settings
} from 'lucide-react';
import SecurityDashboard from '@/components/SecurityDashboard';
import SecuritySettings from '@/components/SecuritySettings';
import RecentActivity from '@/components/RecentActivity';
import UserProfile from '@/components/UserProfile';
import DashboardMetrics from '@/components/DashboardMetrics';

const DashboardControls: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverview, setShowOverview] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    // Implement search functionality
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search everything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </form>

        {/* Control Buttons */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowOverview(true)}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowSecurity(true)}
            className="flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowActivity(true)}
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>Activity</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Overview Dialog - Shows the actual dashboard metrics */}
      <Dialog open={showOverview} onOpenChange={setShowOverview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CRM Overview</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <DashboardMetrics />
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Dialog - Full security dashboard */}
      <Dialog open={showSecurity} onOpenChange={setShowSecurity}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Security Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <SecurityDashboard />
            <SecuritySettings />
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog - Shows recent activity from Supabase */}
      <Dialog open={showActivity} onOpenChange={setShowActivity}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recent Activity</DialogTitle>
          </DialogHeader>
          <RecentActivity />
        </DialogContent>
      </Dialog>

      {/* Settings Dialog - User profile and system settings */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <UserProfile />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardControls;
