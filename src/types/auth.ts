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
  zone_id?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  gender?: 'MALE' | 'FEMALE';
  date_of_birth?: string;
  choir?: string;
  address?: string;
  highest_degree?: string;
  marital_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  baptism_date?: string | null;
  is_married_in_church?: boolean;
  marriage_date?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface UserProfileResponse {
  user: User;
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
  // Additional fields from API
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  choir?: string;
  highestDegree?: string;
  maritalStatus?: string;
  baptismDate?: string | null;
  isMarriedInChurch?: boolean;
  marriageDate?: string;
  accountStatus?: string;
  isVerified?: boolean;
  profileId?: string;
}

// Helper function to convert API user to legacy format
export const convertApiUserToLegacy = (apiUser: User): LegacyUser => {
  const roleMapping: Record<string, LegacyUserRole> = {
    'MEMBER': 'member',
    'ZONE_LEADER': 'zone-leader',
    'PASTOR': 'pastor',
    'PARISH_PASTOR': 'parish-pastor',
    'RoleEnum.PARISH_PASTOR': 'parish-pastor',
    'RoleEnum.PASTOR': 'pastor',
    'RoleEnum.ZONE_LEADER': 'zone-leader',
    'RoleEnum.MEMBER': 'member'
  };

  // Extract role from the enum format if present
  const roleKey = apiUser.role.includes('RoleEnum.') ? apiUser.role : apiUser.role;
  const mappedRole = roleMapping[roleKey] || 'member';

  // Create full name from first and last name, or fallback to email
  const fullName = apiUser.first_name && apiUser.last_name 
    ? `${apiUser.first_name} ${apiUser.last_name}`
    : apiUser.email.split('@')[0]
        .split(/[._-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

  return {
    id: apiUser.auth_id,
    name: fullName,
    email: apiUser.email,
    role: mappedRole,
    zoneId: apiUser.zone_id,
    profileImage: undefined,
    phone: apiUser.phone_number,
    address: apiUser.address,
    bio: undefined,
    joinDate: undefined,
    // Additional fields from API
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    phoneNumber: apiUser.phone_number,
    gender: apiUser.gender,
    dateOfBirth: apiUser.date_of_birth,
    choir: apiUser.choir,
    highestDegree: apiUser.highest_degree,
    maritalStatus: apiUser.marital_status,
    baptismDate: apiUser.baptism_date,
    isMarriedInChurch: apiUser.is_married_in_church,
    marriageDate: apiUser.marriage_date,
    accountStatus: apiUser.account_status,
    isVerified: apiUser.is_verified,
    profileId: apiUser.profile_id
  };
};
