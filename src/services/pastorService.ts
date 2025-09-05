import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types/auth';

export interface Pastor {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  isChoirMember: boolean;
  accountStatus: 'active' | 'inactive';
  profileImage?: string;
  choir?: string;
  highestDegree?: string;
  sacraments: {
    baptism?: { date: string };
    marriage?: { date: string; place: string };
};
}

export interface PastorData {
    profile_id: string;
    auth_id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    gender: 'MALE' | 'FEMALE' | string;
    email: string;
    account_status: 'ACTIVE' | 'INACTIVE' | string;
    is_verified: boolean;
    choir?: string | null;
    zone_id?: string | null;
    created_at: string;
}

export interface GetPastorResponse {
    message: string;
    pastors: PastorData[];
    total: number;
    access_level: string;
}

export class PastorService {
  static async getPastors(): Promise<ApiResponse<GetPastorResponse>> {
    try {
      const response = await apiClient.get<GetPastorResponse>('/users/pastors');
      return response;
    } catch (error: unknown) {
      type ApiError = { response?: { data?: { message?: string }, status?: number } };
      const err = error as ApiError;
      return {
        success: false,
        error: {
          message: err?.response?.data?.message || 'Unable to fetch pastors. Please try again.',
          status: err?.response?.status || 0,
        },
      };
    }
  }
}