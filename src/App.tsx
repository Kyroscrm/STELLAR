
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import JobsPage from '@/pages/JobsPage';
import TasksPage from '@/pages/TasksPage';
import CustomersPage from '@/pages/CustomersPage';
import LeadsPage from '@/pages/LeadsPage';
import EstimatesPage from '@/pages/EstimatesPage';
import InvoicesPage from '@/pages/InvoicesPage';
import CalendarPage from '@/pages/CalendarPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/leads" element={<LeadsPage />} />
                    <Route path="/estimates" element={<EstimatesPage />} />
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
