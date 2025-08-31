import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthService } from '@/services/authService';
import { convertApiUserToLegacy, LegacyUser } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: LegacyUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: LegacyUser }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'INITIALIZE_AUTH'; payload: LegacyUser | null };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        initialized: true,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: true,
      };
    case 'INITIALIZE_AUTH':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        initialized: true,
      };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = AuthService.getToken();
      const storedUser = AuthService.getUser();
      
      if (token && storedUser) {
        try {
          // Verify token with server
          const response = await AuthService.getCurrentUser();
          
          if (response.success && response.data) {
            const legacyUser = convertApiUserToLegacy(response.data.user);
            dispatch({ type: 'INITIALIZE_AUTH', payload: legacyUser });
          } else {
            // Token is invalid, clear storage
            AuthService.logout();
            dispatch({ type: 'INITIALIZE_AUTH', payload: null });
          }
        } catch (error) {
          // Error occurred, clear storage
          AuthService.logout();
          dispatch({ type: 'INITIALIZE_AUTH', payload: null });
        }
      } else {
        dispatch({ type: 'INITIALIZE_AUTH', payload: null });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await AuthService.login({ email, password });
      
      if (response.success && response.data) {
        // After successful login, fetch complete user data from /auth/me
        try {
          const userResponse = await AuthService.getCurrentUser();
          
          if (userResponse.success && userResponse.data) {
            const legacyUser = convertApiUserToLegacy(userResponse.data.user);
            dispatch({ type: 'LOGIN_SUCCESS', payload: legacyUser });
            toast({
              title: "Login Successful",
              description: `Welcome back, ${legacyUser.name}!`,
              variant: "success",
            });
            return { success: true };
          } else {
            // Fallback to login response user data if /auth/me fails
            const legacyUser = convertApiUserToLegacy(response.data.user);
            dispatch({ type: 'LOGIN_SUCCESS', payload: legacyUser });
            toast({
              title: "Login Successful",
              description: `Welcome back, ${legacyUser.name}!`,
              variant: "success",
            });
            return { success: true };
          }
        } catch (userError) {
          // Fallback to login response user data if /auth/me fails
          const legacyUser = convertApiUserToLegacy(response.data.user);
          dispatch({ type: 'LOGIN_SUCCESS', payload: legacyUser });
          toast({
            title: "Login Successful",
            description: `Welcome back, ${legacyUser.name}!`,
            variant: "success",
          });
          return { success: true };
        }
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
        
        // Provide more specific error messages
        let errorMessage = 'Login failed. Please check your credentials and try again.';
        
        if (response.error?.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (response.error?.status === 0) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (response.error?.message) {
          // Try to parse the error message from the server
          try {
            const serverError = JSON.parse(response.error.message);
            if (serverError.message) {
              errorMessage = serverError.message;
            }
          } catch {
            // If parsing fails, use the original message
            errorMessage = response.error.message;
          }
        }
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "error",
        });
        
        return { 
          success: false, 
          error: errorMessage
        };
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      
      const errorMessage = 'Network error. Please check your internet connection and try again.';
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "error",
      });
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    AuthService.logout();
    dispatch({ type: 'LOGOUT' });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "info",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      login, 
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};