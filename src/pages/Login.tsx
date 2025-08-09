import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, UserRole } from '@/context/AuthContext';
import { User, Users, Crown, Shield, Mail, Lock } from 'lucide-react';
import logoImage from '@/assets/logo.png';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, state } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const initialRole = searchParams.get('role') as UserRole;

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [state.isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd validate email/password
    await login(initialRole || 'member');
  };

  const handleDemoLogin = async (role: UserRole) => {
    await login(role);
  };

  const roleIcons = {
    member: User,
    'zone-leader': Users,
    pastor: Crown,
    'parish-pastor': Shield,
  };

  const roleLabels = {
    member: 'Member',
    'zone-leader': 'Zone Leader',
    pastor: 'Pastor',
    'parish-pastor': 'Parish Pastor',
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
              <CardTitle className="text-2xl">Welcome to ADEPR Kamuhoza</CardTitle>
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
                onClick={() => console.log('Forgot password clicked')}
              >
                Forgot your password?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Login Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Demo Accounts</CardTitle>
            <CardDescription className="text-center">
              Try the system with different user roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(roleLabels).map(([role, label]) => {
              const Icon = roleIcons[role as UserRole];
              return (
                <Button
                  key={role}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleDemoLogin(role as UserRole)}
                  disabled={state.loading}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  Login as {label}
                </Button>
              );
            })}
          </CardContent>
        </Card>

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
  );
};