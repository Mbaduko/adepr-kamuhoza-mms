import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export type UserRole = 'member' | 'zone-leader' | 'pastor' | 'parish-pastor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  zoneId?: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
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
      };
    case 'LOGIN_FAILURE':
      return { ...state, user: null, isAuthenticated: false, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (role: UserRole) => {
    dispatch({ type: 'LOGIN_START' });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUsers: Record<UserRole, User> = {
      'member': {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        role: 'member',
        zoneId: 'zone-1',
        profileImage: '/api/placeholder/40/40'
      },
      'zone-leader': {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        role: 'zone-leader',
        zoneId: 'zone-1',
        profileImage: '/api/placeholder/40/40'
      },
      'pastor': {
        id: '3',
        name: 'Rev. Michael Brown',
        email: 'michael.brown@email.com',
        role: 'pastor',
        profileImage: '/api/placeholder/40/40'
      },
      'parish-pastor': {
        id: '4',
        name: 'Rev. Dr. David Wilson',
        email: 'david.wilson@email.com',
        role: 'parish-pastor',
        profileImage: '/api/placeholder/40/40'
      }
    };

    dispatch({ type: 'LOGIN_SUCCESS', payload: mockUsers[role] });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
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