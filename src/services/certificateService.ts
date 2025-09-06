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

// New API payload/response for POST /certificates/request
export type CertificateTypeApi = 'baptism' | 'marriage' | 'recommandation';

export interface RequestCertificatePayload {
  certificate_type: CertificateTypeApi;
  reason: string;
}

export interface RequestCertificateResponse {
  message: string;
  certificate: {
    request_id: string;
    certificate_type: CertificateTypeApi;
    request_date: string;
    status: 'pending' | 'approved' | 'rejected' | 'in-review' | string;
    requested_by: string;
    reason: string;
    progress: string | null;
    timeline: unknown;
    certificate_pdf_url: string | null;
  };
}

export class CertificateService {
  /**
   * Get all certificate requests
   */
  static async getAllRequests(): Promise<ApiResponse<CertificateRequest[]>> {
    try {
      // Real API returns { value: [...], Count: number }
      const response = await apiClient.get<{ value: Array<{
        request_id: string;
        certificate_type: string;
        request_date: string;
        status: 'pending' | 'approved' | 'rejected' | 'in-review' | string;
        progress?: string | null;
        requester_name: string;
      }>; Count?: number }>('/certificates/');

      if (!response.success || !response.data) return response as unknown as ApiResponse<CertificateRequest[]>;

      const mapped: CertificateRequest[] = response.data.value.map((it) => ({
        id: it.request_id,
        memberId: '',
        memberName: it.requester_name,
        // Map API certificate types to UI types
        certificateType: (it.certificate_type === 'confirmation' ? 'recommendation' : it.certificate_type) as CertificateRequest['certificateType'],
        purpose: '',
        requestDate: it.request_date,
        status: (it.status as CertificateRequest['status']) || 'pending',
        approvals: {},
      }));

      return { success: true, data: mapped };
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
   * Request a certificate using the new endpoint
   */
  static async requestCertificate(payload: RequestCertificatePayload): Promise<ApiResponse<RequestCertificateResponse>> {
    try {
      const response = await apiClient.post<RequestCertificateResponse>('/certificates/request', payload);
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to request certificate. Please try again.',
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
