"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, Info } from "lucide-react"
import logoImage from "@/assets/logo.png"

export const Login: React.FC = () => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const { state, login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [state.isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "error",
      });
      return;
    }
    
    const result = await login(email, password);
    if (!result.success) {
      toast({
        title: "Login Failed",
        description: result.error || 'Login failed',
        variant: "error",
      });
    } else {
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to dashboard...",
        variant: "success",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Login Form */}
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src={logoImage} 
                alt="Church Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Welcome to ADEPR Muhoza</CardTitle>
              <CardDescription>
                Sign in to access your member account and church services
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={state.loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={state.loading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={state.loading}
              >
                {state.loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Forgot Password */}
            <div className="text-center">
              <Button 
                variant="link" 
                className="text-sm text-muted-foreground hover:text-primary p-0"
                onClick={() => {
                  toast({
                    title: "Feature Coming Soon",
                    description: "Password reset functionality will be available soon.",
                    variant: "info",
                  });
                }}
              >
                Forgot your password?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Development Info */}
        {import.meta.env.DEV && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm text-blue-800">Development Mode</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-blue-700 space-y-2">
                <p>• API is connected via proxy to avoid CORS issues</p>
                <p>• You need valid credentials to login</p>
                <p>• Contact the administrator to create a test account</p>
                <p>• Current API: {import.meta.env.VITE_API_BASE_URL || 'https://church-k6ws.onrender.com'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back to Home */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}