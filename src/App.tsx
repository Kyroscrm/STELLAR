import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ServicesPage from "./pages/ServicesPage";
import GalleryPage from "./pages/GalleryPage";
import ReviewsPage from "./pages/ReviewsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/admin/leads" element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <LeadsPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/admin/customers" element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <CustomersPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/admin/jobs" element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <JobsPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/admin/tasks" element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <TasksPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/admin/estimates" element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <EstimatesPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/admin/invoices" element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <InvoicesPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/admin/integrations" element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <IntegrationsPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/admin/settings" element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <SettingsPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                
                {/* Client Routes */}
                <Route path="/client" element={
                  <ErrorBoundary>
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
