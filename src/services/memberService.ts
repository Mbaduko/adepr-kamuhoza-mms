import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types/auth';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  zoneId: string;
  isChoirMember: boolean;
  accountStatus: 'active' | 'inactive';
  profileImage?: string;
  choir?: string;
  highestDegree?: string;
  sacraments: {
    baptism?: { date: string};
    marriage?: { date: string; place: string };
  };
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: "MALE" | "FEMALE";
  date_of_birth: string;
  profile_photo_url: string;
  address: string;
  highest_degree: string;
  marital_status: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  baptism_date: string;
  is_married_in_church: boolean;
  marriage_date?: string; // Optional - only for married users
  choir?: string; // Optional - will be optional in backend
  zone_id?: string; // Optional zone assignment
  email: string;
  role: "MEMBER" | "PASTOR";
  account_status: "ACTIVE";
}

export interface CreateUserResponse {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  profile_photo_url: string;
  address: string;
  highest_degree: string;
  marital_status: string;
  baptism_date: string;
  is_married_in_church: boolean;
  marriage_date: string;
  choir: string;
  created_at: string;
  updated_at: string;
}

export interface ZoneMemberResponse {
  message: string;
  zones: Array<{
    zone_id: string | null;
    zone_name: string;
    members: Array<{
      profile_id: string;
      first_name: string;
      last_name: string;
      phone_number: string;
      gender: "MALE" | "FEMALE";
      date_of_birth: string;
      choir: string | null;
      address: string | null;
      highest_degree: string | null;
      marital_status: "single" | "married" | "divorced" | "widowed";
      baptism_date: string | null;
      is_married_in_church: boolean;
      marriage_date: string | null;
      created_at: string;
      photo: string | null;
      zone_id: string | null;
      user: {
        auth_id: string;
        email: string;
        role: string;
        account_status: 'active' | 'inactive';
        is_verified: boolean;
      };
    }>;
    member_count: number;
  }>;
  total_zones: number;
  total_members: number;
  access_level: string;
  user_role: string;
}

export class MemberService {

  /**
   * Get zone members using the new endpoint
   */
  static async getZoneMembers(): Promise<ApiResponse<ZoneMemberResponse>> {
    try {
      const response = await apiClient.get<ZoneMemberResponse>('/users/zone-members');
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }, status?: number } };
      return {
        success: false,
        error: {
          message: err.response?.data?.message || 'Unable to fetch zone members. Please try again.',
          status: err.response?.status || 0,
        },
      };
    }
  }

  /**
   * Get members by zone (filters from zone-members endpoint)
   */
  static async getMembersByZone(zoneId: string): Promise<ApiResponse<Member[]>> {
    try {
      const response = await apiClient.get<ZoneMemberResponse>('/users/zone-members');
      
      if (response.success && response.data) {
        // Filter members by zone and convert to Member interface
        const zoneMembers = response.data.members
          .filter(member => member.zone_id === zoneId)
          .map(member => ({
            id: member.id,
            name: `${member.first_name} ${member.last_name}`,
            email: member.email,
            phone: member.phone_number,
            dateOfBirth: member.date_of_birth,
            gender: member.gender.toLowerCase() as 'male' | 'female',
            maritalStatus: member.marital_status.toLowerCase() as 'single' | 'married' | 'divorced' | 'widowed',
            address: '', // Not provided in API response
            zoneId: member.zone_id || '',
            isChoirMember: false, // Not provided in API response
            accountStatus: member.account_status.toLowerCase() as 'active' | 'inactive',
            profileImage: '', // Not provided in API response
            sacraments: {
              baptism: undefined,
              recommendation: undefined,
              marriage: undefined,
            },
          }));

        return {
          success: true,
          data: zoneMembers,
        };
      } else {
        return {
          success: false,
          error: response.error,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Unable to fetch zone members. Please try again.',
          status: error.response?.status || 0,
        },
      };
    }
  }

  /**
   * Get member by ID (filters from zone-members endpoint)
   */
  static async getMemberById(id: string): Promise<ApiResponse<Member>> {
    try {
      const response = await apiClient.get<ZoneMemberResponse>('/users/zone-members');
      
      if (response.success && response.data) {
        // Find member by ID and convert to Member interface
        const member = response.data.members.find(m => m.id === id);
        
        if (member) {
          const convertedMember: Member = {
            id: member.id,
            name: `${member.first_name} ${member.last_name}`,
            email: member.email,
            phone: member.phone_number,
            dateOfBirth: member.date_of_birth,
            gender: member.gender.toLowerCase() as 'male' | 'female',
            maritalStatus: member.marital_status.toLowerCase() as 'single' | 'married' | 'divorced' | 'widowed',
            address: '', // Not provided in API response
            zoneId: member.zone_id || '',
            isChoirMember: false, // Not provided in API response
            accountStatus: member.account_status.toLowerCase() as 'active' | 'inactive',
            profileImage: '', // Not provided in API response
            sacraments: {
              baptism: undefined,
              recommendation: undefined,
              marriage: undefined,
            },
          };

          return {
            success: true,
            data: convertedMember,
          };
        } else {
          return {
            success: false,
            error: {
              message: 'Member not found',
              status: 404,
            },
          };
        }
      } else {
        return {
          success: false,
          error: response.error,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Unable to fetch member details. Please try again.',
          status: error.response?.status || 0,
        },
      };
    }
  }

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<ApiResponse<CreateUserResponse>> {
    try {
      const response = await apiClient.post<CreateUserResponse>('/users/', userData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Unable to create user. Please try again.',
          status: error.response?.status || 0,
        },
      };
    }
  }
}
