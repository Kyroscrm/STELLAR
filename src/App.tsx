
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

// Public website pages
import Index from '@/pages/Index';
import ServicesPage from '@/pages/ServicesPage';
import GalleryPage from '@/pages/GalleryPage';
import ReviewsPage from '@/pages/ReviewsPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import LoginPage from '@/pages/LoginPage';

// CRM pages
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import ClientDashboard from '@/pages/ClientDashboard';
import JobsPage from '@/pages/JobsPage';
import TasksPage from '@/pages/TasksPage';
import CustomersPage from '@/pages/CustomersPage';
import LeadsPage from '@/pages/LeadsPage';
import EstimatesPage from '@/pages/EstimatesPage';
import InvoicesPage from '@/pages/InvoicesPage';
import CalendarPage from '@/pages/CalendarPage';
import SettingsPage from '@/pages/SettingsPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            {/* Public website routes */}
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Client portal route */}
            <Route path="/client" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin/Staff CRM routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
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
