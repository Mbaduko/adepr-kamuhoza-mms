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
}
