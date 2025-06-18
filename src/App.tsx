
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';
import ClientPortalLayout from '@/layouts/ClientPortalLayout';
import DashboardPage from '@/pages/DashboardPage';
import CustomersPage from '@/pages/CustomersPage';
import LeadsPage from '@/pages/LeadsPage';
import JobsPage from '@/pages/JobsPage';
import EstimatesPage from '@/pages/EstimatesPage';
import InvoicesPage from '@/pages/InvoicesPage';
import CalendarPage from '@/pages/CalendarPage';
import ClientDashboard from '@/pages/ClientDashboard';
import Index from '@/pages/Index';
import ServicesPage from '@/pages/ServicesPage';
import GalleryPage from '@/pages/GalleryPage';
import ReviewsPage from '@/pages/ReviewsPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import LoginPage from '@/pages/LoginPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="estimates" element={<EstimatesPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          <Route path="/client" element={
            <ProtectedRoute>
              <ClientPortalLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ClientDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
