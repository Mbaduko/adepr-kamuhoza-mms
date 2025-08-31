import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types/auth';

export interface CertificateRequest {
  id: string;
  memberId: string;
  memberName: string;
  certificateType: 'baptism' | 'recommendation' | 'marriage' | 'membership';
  purpose: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
  approvals: {
    level1?: { approvedBy: string; date: string; comments?: string };
    level2?: { approvedBy: string; date: string; comments?: string };
    level3?: { approvedBy: string; date: string; comments?: string };
  };
  rejectionReason?: string;
}

export interface NewRequestInput {
  memberId: string;
  memberName: string;
  certificateType: CertificateRequest['certificateType'];
  purpose: string;
}

export class CertificateService {
  /**
   * Get all certificate requests
   */
  static async getAllRequests(): Promise<ApiResponse<CertificateRequest[]>> {
    try {
      const response = await apiClient.get<CertificateRequest[]>('/certificates');
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to fetch certificate requests. Please check your internet connection and try again.',
          status: 0,
        },
      };
    }
  }

  /**
   * Get requests by member ID
   */
  static async getRequestsByMemberId(memberId: string): Promise<ApiResponse<CertificateRequest[]>> {
    try {
      const response = await apiClient.get<CertificateRequest[]>(`/certificates?memberId=${memberId}`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to fetch member certificate requests. Please check your internet connection and try again.',
          status: 0,
        },
      };
    }
  }

  /**
   * Create new certificate request
   */
  static async createRequest(input: NewRequestInput): Promise<ApiResponse<CertificateRequest>> {
    try {
      const response = await apiClient.post<CertificateRequest>('/certificates', input);
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to create certificate request. Please check your internet connection and try again.',
          status: 0,
        },
      };
    }
  }

  /**
   * Approve certificate request
   */
  static async approveRequest(
    id: string, 
    level: 1 | 2 | 3, 
    approvedBy: string, 
    comments?: string
  ): Promise<ApiResponse<CertificateRequest>> {
    try {
      const response = await apiClient.patch<CertificateRequest>(`/certificates/${id}/approve`, {
        level,
        approvedBy,
        comments,
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to approve certificate request. Please check your internet connection and try again.',
          status: 0,
        },
      };
    }
  }

  /**
   * Reject certificate request
   */
  static async rejectRequest(
    id: string, 
    level: 1 | 2 | 3, 
    approvedBy: string, 
    reason: string
  ): Promise<ApiResponse<CertificateRequest>> {
    try {
      const response = await apiClient.patch<CertificateRequest>(`/certificates/${id}/reject`, {
        level,
        approvedBy,
        reason,
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to reject certificate request. Please check your internet connection and try again.',
          status: 0,
        },
      };
    }
  }
}
