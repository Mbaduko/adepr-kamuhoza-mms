export type UserRole = 'MEMBER' | 'ZONE_LEADER' | 'PASTOR' | 'PARISH_PASTOR';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  auth_id: string;
  email: string;
  role: UserRole;
  account_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  is_verified: boolean;
  profile_id?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface UserProfileResponse {
  auth_id: string;
  email: string;
  role: UserRole;
  account_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  is_verified: boolean;
  profile_id?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Legacy types for backward compatibility with existing components
export type LegacyUserRole = 'member' | 'zone-leader' | 'pastor' | 'parish-pastor';

export interface LegacyUser {
  id: string;
  name: string;
  email: string;
  role: LegacyUserRole;
  zoneId?: string;
  profileImage?: string;
  phone?: string;
  address?: string;
  bio?: string;
  joinDate?: string;
}

// Helper function to convert API user to legacy format
export const convertApiUserToLegacy = (apiUser: User): LegacyUser => {
  const roleMapping: Record<UserRole, LegacyUserRole> = {
    'MEMBER': 'member',
    'ZONE_LEADER': 'zone-leader',
    'PASTOR': 'pastor',
    'PARISH_PASTOR': 'parish-pastor'
  };

  return {
    id: apiUser.auth_id,
    name: apiUser.email.split('@')[0], // Fallback name from email
    email: apiUser.email,
    role: roleMapping[apiUser.role],
    profileImage: undefined,
    phone: undefined,
    address: undefined,
    bio: undefined,
    joinDate: undefined
  };
};
