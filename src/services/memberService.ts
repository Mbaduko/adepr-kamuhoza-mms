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
  accountStatus: 'ACTIVE' | 'INACTVE';
  profileImage?: string;
  choir?: string;
  highestDegree?: string;
  authId?: string;
  role?: 'MEMBER' | 'ZONE_LEADER' | 'PASTOR' | 'PARISH_PASTOR' | string;
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
  role: "MEMBER" | "PASTOR" | "ZONE_LEADER";
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

export type UpdateUserPayload = Partial<{
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: "MALE" | "FEMALE";
  date_of_birth: string;
  profile_photo_url: string;
  address: string;
  highest_degree: string;
  marital_status: "single" | "married" | "divorced" | "widowed";
  baptism_date: string;
  is_married_in_church: boolean;
  marriage_date: string;
  choir: string;
  // role is not listed in docs, but we will include for leader assignment if backend accepts it
  role: "MEMBER" | "ZONE_LEADER" | "PASTOR" | "PARISH_PASTOR";
}>;

export interface UpdateUserRolePayload {
  role: "MEMBER" | "ZONE_LEADER" | "PASTOR" | "PARISH_PASTOR";
  zone_id?: string;
  replace_existing?: boolean;
}

export interface ZoneMemberResponse {
  message: string;
  zones: Array<{
    zone_id: string | null;
    zone_name: string;
    zone_leader: {
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
    }
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
   * Get zone members using the endpoint
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
        // Find the zone by zoneId and convert its members to Member interface
        const zone = response.data.zones.find(z => z.zone_id === zoneId);
        const zoneMembers = zone
          ? zone.members.map(member => ({
              id: member.profile_id,
              name: `${member.first_name} ${member.last_name}`,
              email: member.user.email,
              phone: member.phone_number,
              dateOfBirth: member.date_of_birth,
              gender: member.gender,
              maritalStatus: member.marital_status,
              address: member.address || '',
              zoneId: member.zone_id || '',
              isChoirMember: !!member.choir,
              accountStatus: member.user.account_status,
              profileImage: member.photo || '',
              choir: member.choir || undefined,
              highestDegree: member.highest_degree || undefined,
              sacraments: {
                baptism: member.baptism_date ? { date: member.baptism_date } : undefined,
                marriage: member.marriage_date ? { date: member.marriage_date, place: '' } : undefined,
              },
            }))
          : [];

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
   * Get member by ID (filters from zone-members endpoint)
   */
  static async getMemberById(id: string): Promise<ApiResponse<Member>> {
    try {
      const response = await apiClient.get<ZoneMemberResponse>('/users/zone-members');
      
      if (response.success && response.data) {
        // Search for the member in all zones
        let foundMember: ZoneMemberResponse['zones'][number]['members'][number] | null = null;
        let foundZoneId: string | null = null;
        for (const zone of response.data.zones) {
          const member = zone.members.find(m => m.profile_id === id);
          if (member) {
            foundMember = member;
            foundZoneId = zone.zone_id || '';
            break;
          }
        }

        if (foundMember) {
          const convertedMember: Member = {
            id: foundMember.profile_id,
            name: `${foundMember.first_name} ${foundMember.last_name}`,
            email: foundMember.user.email,
            phone: foundMember.phone_number,
            dateOfBirth: foundMember.date_of_birth,
            gender: foundMember.gender,
            maritalStatus: foundMember.marital_status,
            address: foundMember.address || '',
            zoneId: foundZoneId || '',
            isChoirMember: !!foundMember.choir,
            accountStatus: foundMember.user.account_status,
            profileImage: foundMember.photo || '',
            choir: foundMember.choir || undefined,
            highestDegree: foundMember.highest_degree || undefined,
            sacraments: {
              baptism: foundMember.baptism_date ? { date: foundMember.baptism_date } : undefined,
              marriage: foundMember.marriage_date ? { date: foundMember.marriage_date, place: '' } : undefined,
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }, status?: number } };
      return {
        success: false,
        error: {
          message: err.response?.data?.message || 'Unable to fetch member details. Please try again.',
          status: err.response?.status || 0,
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }, status?: number } };
      return {
        success: false,
        error: {
          message: err.response?.data?.message || 'Unable to create user. Please try again.',
          status: err.response?.status || 0,
        },
      };
    }
  }

  /**
   * Update user info by auth_id
   */
  static async updateUser(id: string, payload: UpdateUserPayload): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<any>(`/users/${id}`, payload);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }, status?: number } };
      return {
        success: false,
        error: {
          message: err.response?.data?.message || 'Unable to update user. Please try again.',
          status: err.response?.status || 0,
        },
      };
    }
  }

  /**
   * Change user role with role-based access control
   * PUT /auth/users/{user_id}/role
   */
  static async updateUserRole(userId: string, payload: UpdateUserRolePayload): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<any>(`/auth/users/${userId}/role`, payload);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }, status?: number } };
      return {
        success: false,
        error: {
          message: err.response?.data?.message || 'Unable to change user role. Please try again.',
          status: err.response?.status || 0,
        },
      };
    }
  }
}

