
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import LeadsPage from "./pages/LeadsPage";
import CustomersPage from "./pages/CustomersPage";
import JobsPage from "./pages/JobsPage";
import TasksPage from "./pages/TasksPage";
import EstimatesPage from "./pages/EstimatesPage";
import InvoicesPage from "./pages/InvoicesPage";
import SettingsPage from "./pages/SettingsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/leads" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <LeadsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/customers" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <CustomersPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/jobs" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <JobsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/tasks" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <TasksPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/estimates" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <EstimatesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/invoices" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <InvoicesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/integrations" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <IntegrationsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              {/* Client Routes */}
              <Route path="/client" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
