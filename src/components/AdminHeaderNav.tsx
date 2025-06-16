
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/ui/global-search';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Bell, 
  Settings, 
  Activity, 
  Shield, 
  BarChart3,
  User
} from 'lucide-react';
import SecurityDashboard from '@/components/SecurityDashboard';
import { useAuth } from '@/contexts/AuthContext';

const AdminHeaderNav: React.FC = () => {
  const [showOverview, setShowOverview] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex items-center space-x-4">
      {/* Global Search */}
      <div className="w-64">
        <GlobalSearch />
      </div>

      {/* Overview Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowOverview(true)}
        className="flex items-center space-x-2"
      >
        <BarChart3 className="h-4 w-4" />
        <span>Overview</span>
      </Button>

      {/* Security Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSecurity(true)}
        className="flex items-center space-x-2"
      >
        <Shield className="h-4 w-4" />
        <span>Security</span>
      </Button>

      {/* Activity Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowActivity(true)}
        className="flex items-center space-x-2"
      >
        <Activity className="h-4 w-4" />
        <span>Activity</span>
        <Badge variant="secondary" className="ml-1">3</Badge>
      </Button>

      {/* Settings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowSettings(true)}>
            <User className="h-4 w-4 mr-2" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notifications */}
      <Button variant="ghost" size="sm">
        <Bell className="h-4 w-4" />
        <Badge variant="destructive" className="ml-1">2</Badge>
      </Button>

      {/* Dialogs */}
      <Dialog open={showOverview} onOpenChange={setShowOverview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CRM Overview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Comprehensive overview of your CRM performance and metrics.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSecurity} onOpenChange={setShowSecurity}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Security Dashboard</DialogTitle>
          </DialogHeader>
          <SecurityDashboard />
        </DialogContent>
      </Dialog>

      <Dialog open={showActivity} onOpenChange={setShowActivity}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recent Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Recent activities and system logs will be displayed here.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>User and system settings configuration.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHeaderNav;
