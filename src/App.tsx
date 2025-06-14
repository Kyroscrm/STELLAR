
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
import TasksPage from "./pages/TasksPage"; // New import
import EstimatesPage from "./pages/EstimatesPage"; // New import
import InvoicesPage from "./pages/InvoicesPage"; // New import
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
                  <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navigation />
                    <div className="flex-1">
                      <AdminDashboard />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/leads" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navigation />
                    <div className="flex-1">
                      <LeadsPage />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/customers" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navigation />
                    <div className="flex-1">
                      <CustomersPage />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navigation />
                    <div className="flex-1">
                      <JobsPage />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            {/* New Routes */}
            <Route 
              path="/admin/tasks" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navigation />
                    <div className="flex-1">
                      <TasksPage />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/estimates" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navigation />
                    <div className="flex-1">
                      <EstimatesPage />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/invoices" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navigation />
                    <div className="flex-1">
                      <InvoicesPage />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navigation />
                    <div className="flex-1">
                      <SettingsPage />
                    </div>
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
