import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { useRealTimePresence } from "@/hooks/useRealTimePresence";
import Index from "./pages/Index";
import ServicesPage from "./pages/ServicesPage";
import GalleryPage from "./pages/GalleryPage";
import ReviewsPage from "./pages/ReviewsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PasswordReset from "./pages/PasswordReset";
import ProfilePage from "./pages/ProfilePage";
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

// Real-time wrapper component
const RealTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useRealTimeNotifications(); // Initialize real-time notifications
  useRealTimePresence(); // Initialize presence tracking
  
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RealTimeProvider>
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
                  <Route path="/password-reset" element={<PasswordReset />} />
                  
                  {/* Protected Profile Route */}
                  <Route path="/profile" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  
                  {/* Admin Routes with Layout */}
                  <Route path="/admin" element={
                    <ErrorBoundary>
                      <ProtectedRoute allowedRoles={['admin', 'staff']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="leads" element={<LeadsPage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="jobs" element={<JobsPage />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="estimates" element={<EstimatesPage />} />
                    <Route path="invoices" element={<InvoicesPage />} />
                    <Route path="integrations" element={<IntegrationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                  
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
          </RealTimeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
