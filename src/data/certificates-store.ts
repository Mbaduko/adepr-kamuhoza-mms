import { create } from 'zustand';
import { CertificateService, CertificateRequest, NewRequestInput } from '@/services/certificateService';

interface CertificatesState {
  requests: CertificateRequest[];
  loading: boolean;
  error: string | null;
  selectedRequest: CertificateRequest | null;
}

interface CertificatesActions {
  // State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedRequest: (request: CertificateRequest | null) => void;
  
  // Actions
  fetchAllRequests: () => Promise<void>;
  fetchRequestsByMember: (memberId: string) => Promise<void>;
  createRequest: (input: NewRequestInput) => Promise<boolean>;
  approveRequest: (id: string, level: 1 | 2 | 3, approvedBy: string, comments?: string) => Promise<boolean>;
  rejectRequest: (id: string, level: 1 | 2 | 3, approvedBy: string, reason: string) => Promise<boolean>;
  
  // Reset
  reset: () => void;
}

const initialState: CertificatesState = {
  requests: [],
  loading: false,
  error: null,
  selectedRequest: null,
};

export const useCertificatesStore = create<CertificatesState & CertificatesActions>((set, get) => ({
  ...initialState,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedRequest: (request) => set({ selectedRequest: request }),

  fetchAllRequests: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await CertificateService.getAllRequests();
      
      if (response.success && response.data) {
        set({ requests: response.data, loading: false });
      } else {
        set({ 
          error: response.error?.message || 'Failed to fetch certificate requests',
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Network error occurred while fetching certificate requests',
        loading: false 
      });
    }
  },

  fetchRequestsByMember: async (memberId: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await CertificateService.getRequestsByMemberId(memberId);
      
      if (response.success && response.data) {
        set({ requests: response.data, loading: false });
      } else {
        set({ 
          error: response.error?.message || 'Failed to fetch member certificate requests',
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Network error occurred while fetching member certificate requests',
        loading: false 
      });
    }
  },

  createRequest: async (input: NewRequestInput) => {
    set({ loading: true, error: null });
    
    try {
      const response = await CertificateService.createRequest(input);
      
      if (response.success && response.data) {
        // Add the new request to the list
        const currentRequests = get().requests;
        set({ 
          requests: [response.data, ...currentRequests],
          loading: false 
        });
        return true;
      } else {
        set({ 
          error: response.error?.message || 'Failed to create certificate request',
          loading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: 'Network error occurred while creating certificate request',
        loading: false 
      });
      return false;
    }
  },

  approveRequest: async (id: string, level: 1 | 2 | 3, approvedBy: string, comments?: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await CertificateService.approveRequest(id, level, approvedBy, comments);
      
      if (response.success && response.data) {
        // Update the request in the list
        const currentRequests = get().requests;
        const updatedRequests = currentRequests.map(request => 
          request.id === id ? response.data! : request
        );
        set({ 
          requests: updatedRequests,
          loading: false 
        });
        return true;
      } else {
        set({ 
          error: response.error?.message || 'Failed to approve certificate request',
          loading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: 'Network error occurred while approving certificate request',
        loading: false 
      });
      return false;
    }
  },

  rejectRequest: async (id: string, level: 1 | 2 | 3, approvedBy: string, reason: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await CertificateService.rejectRequest(id, level, approvedBy, reason);
      
      if (response.success && response.data) {
        // Update the request in the list
        const currentRequests = get().requests;
        const updatedRequests = currentRequests.map(request => 
          request.id === id ? response.data! : request
        );
        set({ 
          requests: updatedRequests,
          loading: false 
        });
        return true;
      } else {
        set({ 
          error: response.error?.message || 'Failed to reject certificate request',
          loading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: 'Network error occurred while rejecting certificate request',
        loading: false 
      });
      return false;
    }
  },

  reset: () => set(initialState),
}));

