import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types/auth';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  zoneId: string;
  isChoirMember: boolean;
  accountStatus: 'active' | 'inactive';
  profileImage?: string;
  sacraments: {
    baptism?: { date: string; place: string };
    recommendation?: { date: string; place: string };
    marriage?: { date: string; spouse: string; place: string };
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
  marriage_date: string;
  choir: string;
  email: string;
  password: string;
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

export class MemberService {
  /**
   * Get all members
   */
  static async getAllMembers(): Promise<ApiResponse<Member[]>> {
    try {
      const response = await apiClient.get<Member[]>('/members');
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to fetch members. Please check your internet connection and try again.',
          status: 0,
        },
      };
    }
  }

  /**
   * Get members by zone
   */
  static async getMembersByZone(zoneId: string): Promise<ApiResponse<Member[]>> {
    try {
      const response = await apiClient.get<Member[]>(`/members?zoneId=${zoneId}`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to fetch zone members. Please check your internet connection and try again.',
          status: 0,
        },
      };
    }
  }

  /**
   * Get member by ID
   */
  static async getMemberById(id: string): Promise<ApiResponse<Member>> {
    try {
      const response = await apiClient.get<Member>(`/members/${id}`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to fetch member details. Please check your internet connection and try again.',
          status: 0,
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
