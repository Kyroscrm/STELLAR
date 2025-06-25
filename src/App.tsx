import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TourProvider } from "@/contexts/TourContext";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { useRealTimePresence } from "@/hooks/useRealTimePresence";
import { lazy, Suspense } from "react";
import SuspenseLoader from "@/components/SuspenseLoader";

// Lazy load all pages
const Index = lazy(() => import("./pages/Index"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const PasswordReset = lazy(() => import("./pages/PasswordReset"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const LeadsPage = lazy(() => import("./pages/LeadsPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const EstimatesPage = lazy(() => import("./pages/EstimatesPage"));
const InvoicesPage = lazy(() => import("./pages/InvoicesPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const IntegrationsPage = lazy(() => import("./pages/IntegrationsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
    <GlobalErrorBoundary module="Application Root">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RealTimeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <TourProvider>
                  <Routes>
                    {/* Public Pages */}
                    <Route path="/" element={<Suspense fallback={<SuspenseLoader />}><Index /></Suspense>} />
                    <Route path="/services" element={<Suspense fallback={<SuspenseLoader />}><ServicesPage /></Suspense>} />
                    <Route path="/gallery" element={<Suspense fallback={<SuspenseLoader />}><GalleryPage /></Suspense>} />
                    <Route path="/reviews" element={<Suspense fallback={<SuspenseLoader />}><ReviewsPage /></Suspense>} />
                    <Route path="/about" element={<Suspense fallback={<SuspenseLoader />}><AboutPage /></Suspense>} />
                    <Route path="/contact" element={<Suspense fallback={<SuspenseLoader />}><ContactPage /></Suspense>} />
                    <Route path="/login" element={<Suspense fallback={<SuspenseLoader />}><Login /></Suspense>} />
                    <Route path="/register" element={<Suspense fallback={<SuspenseLoader />}><Register /></Suspense>} />
                    <Route path="/password-reset" element={<Suspense fallback={<SuspenseLoader />}><PasswordReset /></Suspense>} />

                    {/* Protected Profile Route */}
                    <Route path="/profile" element={
                      <GlobalErrorBoundary module="Profile">
                        <ProtectedRoute>
                          <Suspense fallback={<SuspenseLoader />}>
                            <ProfilePage />
                          </Suspense>
                        </ProtectedRoute>
                      </GlobalErrorBoundary>
                    } />

                    {/* Admin Routes with Layout */}
                    <Route path="/admin" element={
                      <GlobalErrorBoundary module="Admin Dashboard">
                        <ProtectedRoute allowedRoles={['admin', 'staff']}>
                          <AdminLayout />
                        </ProtectedRoute>
                      </GlobalErrorBoundary>
                    }>
                      <Route index element={
                        <Suspense fallback={<SuspenseLoader />}>
                          <AdminDashboard />
                        </Suspense>
                      } />
                      <Route path="leads" element={
                        <GlobalErrorBoundary module="Leads">
                          <Suspense fallback={<SuspenseLoader />}>
                            <LeadsPage />
                          </Suspense>
                        </GlobalErrorBoundary>
                      } />
                      <Route path="customers" element={
                        <GlobalErrorBoundary module="Customers">
                          <Suspense fallback={<SuspenseLoader />}>
                            <CustomersPage />
                          </Suspense>
                        </GlobalErrorBoundary>
                      } />
                      <Route path="jobs" element={
                        <GlobalErrorBoundary module="Jobs">
                          <Suspense fallback={<SuspenseLoader />}>
                            <JobsPage />
                          </Suspense>
                        </GlobalErrorBoundary>
                      } />
                      <Route path="tasks" element={
                        <GlobalErrorBoundary module="Tasks">
                          <Suspense fallback={<SuspenseLoader />}>
                            <TasksPage />
                          </Suspense>
                        </GlobalErrorBoundary>
                      } />
                      <Route path="estimates" element={
                        <GlobalErrorBoundary module="Estimates">
                          <Suspense fallback={<SuspenseLoader />}>
                            <EstimatesPage />
                          </Suspense>
                        </GlobalErrorBoundary>
                      } />
                      <Route path="invoices" element={
                        <GlobalErrorBoundary module="Invoices">
                          <Suspense fallback={<SuspenseLoader />}>
                            <InvoicesPage />
                          </Suspense>
                        </GlobalErrorBoundary>
                      } />
                      <Route path="integrations" element={
                        <GlobalErrorBoundary module="Integrations">
                          <Suspense fallback={<SuspenseLoader />}>
                            <IntegrationsPage />
                          </Suspense>
                        </GlobalErrorBoundary>
                      } />
                      <Route path="settings" element={
                        <GlobalErrorBoundary module="Settings">
                          <Suspense fallback={<SuspenseLoader />}>
                            <SettingsPage />
                          </Suspense>
                        </GlobalErrorBoundary>
                      } />
                    </Route>

                    {/* Client Routes */}
                    <Route path="/client" element={
                      <GlobalErrorBoundary module="Client Dashboard">
                        <ProtectedRoute allowedRoles={['client']}>
                          <Suspense fallback={<SuspenseLoader />}>
                            <ClientDashboard />
                          </Suspense>
                        </ProtectedRoute>
                      </GlobalErrorBoundary>
                    } />

                    {/* Catch all route */}
                    <Route path="*" element={
                      <Suspense fallback={<SuspenseLoader />}>
                        <NotFound />
                      </Suspense>
                    } />
                  </Routes>
                </TourProvider>
              </BrowserRouter>
            </TooltipProvider>
          </RealTimeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
