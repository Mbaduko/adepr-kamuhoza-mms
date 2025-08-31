import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/services/authService';
import { LoginRequest, LoginResponse, UserRole, User } from '@/types/auth';

export interface AuthenticatedUser {
  auth_id: string;
  email: string;
  role: UserRole;
  account_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  is_verified: boolean;
}

interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
}

interface UseAuthReturn {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshAuth: () => void;
  fetchCurrentUser: () => Promise<{ success: boolean; error?: string }>;
}

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    token: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = AuthService.getToken();
      const user = AuthService.getUser();
      const isAuthenticated = AuthService.isAuthenticated();
      
      if (isAuthenticated && token && user) {
        // Restore user state from localStorage
        setState(prev => ({
          ...prev,
          token,
          user,
          isAuthenticated: true,
          loading: false,
        }));
      } else {
        // Clear invalid state
        if (isAuthenticated && (!token || !user)) {
          AuthService.logout();
        }
        setState(prev => ({
          ...prev,
          token,
          user: null,
          isAuthenticated: false,
          loading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    console.log('useAuth: Starting login process...');
    setState(prev => ({ ...prev, loading: true }));

    try {
      console.log('useAuth: Calling AuthService.login...');
      const response = await AuthService.login(credentials);
      console.log('useAuth: AuthService.login response:', response);

      if (response.success && response.data) {
        const { user, token } = response.data;
        console.log('useAuth: Login successful, setting state with user:', user);
        
        setState({
          user,
          isAuthenticated: true,
          loading: false,
          token,
        });

        return { success: true };
      } else {
        console.log('useAuth: Login failed:', response.error);
        setState(prev => ({ ...prev, loading: false }));
        return { 
          success: false, 
          error: response.error?.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('useAuth: Login error:', error);
      setState(prev => ({ ...prev, loading: false }));
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      token: null,
    });
  }, []);

  const refreshAuth = useCallback(() => {
    const token = AuthService.getToken();
    const isAuthenticated = AuthService.isAuthenticated();
    
    setState(prev => ({
      ...prev,
      token,
      isAuthenticated,
    }));
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    if (!state.isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await AuthService.getCurrentUser();
      
      if (response.success && response.data) {
        const user = response.data;
        
        // Update localStorage with fresh user data
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        setState(prev => ({
          ...prev,
          user,
        }));
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Failed to fetch user data' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred while fetching user data' 
      };
    }
  }, [state.isAuthenticated]);

  return {
    state,
    login,
    logout,
    refreshAuth,
    fetchCurrentUser,
  };
};
