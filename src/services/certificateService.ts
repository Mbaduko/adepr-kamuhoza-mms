import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types/auth';

export interface CertificateRequest {
  id: string;
  memberId: string;
  memberName: string;
  certificateType: CertificateTypeApi;
  purpose: string;
  requestDate: string;
  status: string;
  approvals: {
    level1?: ApproveAction,
    level2?: ApproveAction,
    level3?: ApproveAction
  };
}

export interface NewRequestInput {
  memberId: string;
  memberName: string;
  certificateType: CertificateRequest['certificateType'];
  purpose: string;
}

// New API payload/response for POST /certificates/request
export type CertificateTypeApi = 'baptism' | 'marriage' | 'recommendation';

export interface RequestCertificatePayload {
  certificate_type: CertificateTypeApi;
  reason: string;
}

export interface ApproveAction{
  action: 'approve' | 'reject',
  comment:string,
  by:string,
  doneAt: Date
}
export interface RequestCertificateResponse {
  message: string;
  certificate: {
    request_id: string;
    certificate_type: CertificateTypeApi;
    request_date: string;
    status: string;
    requested_by: string;
    reason: string;
    progress: string | null;
    timeline: {
      level1?: ApproveAction,
      level2?: ApproveAction,
      level3?: ApproveAction
    };
    certificate_pdf_url: string | null;
  };
}

export class CertificateService {
  /**
   * Get all certificate requests
   */
  static async getAllRequests(): Promise<ApiResponse<CertificateRequest[]>> {
    try {
      // API may return an array or { value: [...], Count }
      const response = await apiClient.get<
        Array<{
          request_id: string;
          certificate_type: string;
          request_date: string;
          status: 'pending' | 'approved' | 'rejected' | 'in-review' | string;
          progress?: string | null;
          requester_name: string;
          requested_by?: string;
          reason?: string;
          owner_profile?: {
            profile_id?: string;
            first_name?: string;
            last_name?: string;
            auth?: { auth_id?: string };
          };
        }> | { value: Array<{
          request_id: string;
          certificate_type: string;
          request_date: string;
          status: 'pending' | 'approved' | 'rejected' | 'in-review' | string;
          progress?: string | null;
          requester_name: string;
          requested_by?: string;
          reason?: string;
          owner_profile?: {
            profile_id?: string;
            first_name?: string;
            last_name?: string;
            auth?: { auth_id?: string };
          };
        }>; Count?: number }
      >('/certificates/');

      if (!response.success || response.data == null) return response as unknown as ApiResponse<CertificateRequest[]>;

      const rawList = Array.isArray(response.data)
        ? response.data
        : (response.data as { value?: unknown }).value ?? [];

      const mapped: CertificateRequest[] = (rawList as Array<any>).map((it) => {
        const fullName = `${it.owner_profile?.first_name ?? ''} ${it.owner_profile?.last_name ?? ''}`.trim()
        return {
          id: it.request_id,
          memberId: it.owner_profile?.auth?.auth_id || it.requested_by || '',
          memberName: fullName || it.requester_name,
          // Normalize API certificate types (e.g., 'confirmation'/'recommandation' => 'recommendation')
          certificateType: (
            it.certificate_type === 'confirmation' || it.certificate_type === 'recommandation'
              ? 'recommendation'
              : it.certificate_type
          ) as CertificateRequest['certificateType'],
          purpose: it.reason || '',
          requestDate: it.request_date,
          status: (it.status as CertificateRequest['status']) || 'pending',
          approvals: it.timeline || {},
        }
      });

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
    // Deprecated server-side filtering: fetch all and let callers filter client-side
    return this.getAllRequests();
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

  static async reviewRequest(certId: string, action: 'approve' | 'reject', comment: string): Promise<ApiResponse<RequestCertificateResponse>> {
    try {
      const response = await apiClient.put<CertificateRequest>(`/certificates/${certId}/review?action=${action}`, { comment });
     } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to approve certificate request. Please check your internet connection and try again.',
          status: 0
        }
      };
    }
  }

  // /**
  //  * Approve certificate request
  //  */
  // static async approveRequest(
  //   id: string, 
  //   level: 1 | 2 | 3, 
  //   approvedBy: string, 
  //   comments?: string
  // ): Promise<ApiResponse<CertificateRequest>> {
  //   try {
  //     const response = await apiClient.patch<CertificateRequest>(`/certificates/${id}/approve`, {
  //       level,
  //       approvedBy,
  //       comments,
  //     });
  //     return response;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: {
  //         message: 'Unable to approve certificate request. Please check your internet connection and try again.',
  //         status: 0,
  //       },
  //     };
  //   }
  // }

  // /**
  //  * Reject certificate request
  //  */
  // static async rejectRequest(
  //   id: string, 
  //   level: 1 | 2 | 3, 
  //   approvedBy: string, 
  //   reason: string
  // ): Promise<ApiResponse<CertificateRequest>> {
  //   try {
  //     const response = await apiClient.patch<CertificateRequest>(`/certificates/${id}/reject`, {
  //       level,
  //       approvedBy,
  //       reason,
  //     });
  //     return response;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: {
  //         message: 'Unable to reject certificate request. Please check your internet connection and try again.',
  //         status: 0,
  //       },
  //     };
  //   }
  // }
}
