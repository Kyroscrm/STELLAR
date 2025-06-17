
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LoadingProvider from "@/components/LoadingProvider";
import ToastProvider from "@/components/ToastProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PasswordReset from "./pages/PasswordReset";
import AdminDashboard from "./pages/AdminDashboard";
import CustomersPage from "./pages/CustomersPage";
import LeadsPage from "./pages/LeadsPage";
import JobsPage from "./pages/JobsPage";
import TasksPage from "./pages/TasksPage";
import EstimatesPage from "./pages/EstimatesPage";
import InvoicesPage from "./pages/InvoicesPage";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import IntegrationsPage from "./pages/IntegrationsPage";
import ReviewsPage from "./pages/ReviewsPage";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import GalleryPage from "./pages/GalleryPage";
import NotFound from "./pages/NotFound";
import ClientLogin from "./pages/ClientLogin";
import ClientDashboard from "./pages/ClientDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LoadingProvider>
        <ToastProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                
                {/* Client Portal routes */}
                <Route path="/client/login" element={<ClientLogin />} />
                <Route path="/client/dashboard" element={<ClientDashboard />} />
                
                {/* Protected admin routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
                <Route path="/admin/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
                <Route path="/admin/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
                <Route path="/admin/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
                <Route path="/admin/estimates" element={<ProtectedRoute><EstimatesPage /></ProtectedRoute>} />
                <Route path="/admin/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
                <Route path="/admin/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/admin/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </LoadingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
