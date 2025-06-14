
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LeadsPage from "./pages/LeadsPage";
import CustomersPage from "./pages/CustomersPage";
import JobsPage from "./pages/JobsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
            <Route 
              path="/client" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50">
                    <Navigation />
                    <AdminDashboard />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/leads" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50">
                    <Navigation />
                    <LeadsPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/customers" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50">
                    <Navigation />
                    <CustomersPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50">
                    <Navigation />
                    <JobsPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50">
                    <Navigation />
                    <SettingsPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
