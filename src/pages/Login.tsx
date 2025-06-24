import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';
import FormFieldError from '@/components/FormFieldError';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for access permission and redirect if not granted
  useEffect(() => {
    const hasAccess = sessionStorage.getItem('loginAccess') === 'granted';
    if (!hasAccess) {
      navigate('/', { replace: true });
      return;
    }
  }, [navigate]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/client', { replace: true });
      }
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        // Clear access permission on successful login
        sessionStorage.removeItem('loginAccess');
        
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to your dashboard..."
        });
        
        // The redirect will happen automatically via the useEffect above
        // when the user state updates
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const fillAdminCredentials = () => {
    setFormData({
      email: 'nayib@finalroofingcompany.com',
      password: 'Final1234@'
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-heading font-bold text-primary">
            Final <span className="text-secondary">Roofing</span> & Retro-Fit
          </h1>
          <p className="text-gray-600 mt-2">Access your project dashboard</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              CRM Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <FormFieldError error={errors.email} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <FormFieldError error={errors.password} />
              </div>

              <div className="text-right">
                <Link 
                  to="/password-reset" 
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Quick Login</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={fillAdminCredentials}
                className="w-full"
                type="button"
                disabled={isLoading}
              >
                Fill Admin Credentials
              </Button>

              <div className="space-y-2 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-primary">Admin Access:</p>
                  <p>Email: nayib@finalroofingcompany.com</p>
                  <p>Password: Final1234@</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need to create an account? 
                <Link to="/register" className="text-primary hover:text-primary/80 font-medium ml-1">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
