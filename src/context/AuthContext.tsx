import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export type UserRole = 'member' | 'zone-leader' | 'pastor' | 'parish-pastor';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  zoneId?: string;
  profileImage?: string;
  phone?: string;
  address?: string;
  bio?: string;
  joinDate?: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  zoneId?: string;
  profileImage?: string;
  phone?: string;
  address?: string;
  bio?: string;
  joinDate?: string;
}

interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthenticatedUser }
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      password: 'password123',
      role: 'member',
      zoneId: 'zone-1',
      profileImage: '/api/placeholder/40/40',
      phone: '+250 789 123 456',
      address: 'Kigali, Rwanda',
      bio: 'Active church member and community volunteer. Passionate about serving others and growing in faith.',
      joinDate: '2020-03-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      password: 'password123',
      role: 'zone-leader',
      zoneId: 'zone-1',
      profileImage: '/api/placeholder/40/40',
      phone: '+250 788 987 654',
      address: 'Kigali, Rwanda',
      bio: 'Zone leader committed to fostering community growth and spiritual development.',
      joinDate: '2018-01-10'
    },
    {
      id: '3',
      name: 'Rev. Michael Brown',
      email: 'michael.brown@email.com',
      password: 'password123',
      role: 'pastor',
      profileImage: '/api/placeholder/40/40',
      phone: '+250 787 555 123',
      address: 'Kigali, Rwanda',
      bio: 'Dedicated pastor serving the community with love and spiritual guidance.',
      joinDate: '2015-06-01'
    },
    {
      id: '4',
      name: 'Rev. Dr. David Wilson',
      email: 'david.wilson@email.com',
      password: 'password123',
      role: 'parish-pastor',
      profileImage: '/api/placeholder/40/40',
      phone: '+250 786 444 789',
      address: 'Kigali, Rwanda',
      bio: 'Parish pastor overseeing multiple churches and communities with pastoral care.',
      joinDate: '2012-08-20'
    }
  ];

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email and validate password
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return { success: false, error: 'Invalid email or password' };
    }
    
    if (user.password !== password) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Remove password from user object before storing in state
    const { password: _, ...userWithoutPassword } = user;
    dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });
    
    return { success: true };
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
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