import { create } from 'zustand';
import { CertificateService, CertificateRequest, NewRequestInput } from '@/services/certificateService';

interface CertificatesState {
  requests: CertificateRequest[];
  loading: boolean;
  error: string | null;
  selectedRequest: CertificateRequest | null;
  isInitialized: boolean;
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
  isInitialized: false,
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
        set({ requests: response.data, loading: false, isInitialized: true });
      } else {
        // Handle endpoint not ready gracefully
        if (response.error?.status === 404 || response.error?.message?.includes('not found')) {
          set({ 
            requests: [], 
            loading: false, 
            error: null, // Don't show error for endpoint not ready
            isInitialized: true 
          });
        } else {
          set({ 
            error: response.error?.message || 'Failed to fetch certificate requests',
            loading: false,
            isInitialized: true
          });
        }
      }
    } catch (error) {
      // Handle network errors gracefully
      set({ 
        requests: [],
        error: null, // Don't show network errors as they might be expected
        loading: false,
        isInitialized: true
      });
    }
  },

  fetchRequestsByMember: async (_memberId: string) => {
    // Backend does not return requested_by; fetch all and let UI filter by name/id
    set({ loading: true, error: null });
    try {
      const response = await CertificateService.getAllRequests();
      if (response.success && response.data) {
        set({ requests: response.data, loading: false, isInitialized: true });
      } else {
        if (response.error?.status === 404 || response.error?.message?.includes('not found')) {
          set({ requests: [], loading: false, error: null, isInitialized: true });
        } else {
          set({ error: response.error?.message || 'Failed to fetch member certificate requests', loading: false, isInitialized: true });
        }
      }
    } catch (error) {
      set({ requests: [], error: null, loading: false, isInitialized: true });
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
        // Handle endpoint not ready gracefully
        if (response.error?.status === 404 || response.error?.message?.includes('not found')) {
          set({ 
            error: 'Certificate service is not yet available. Please try again later.',
            loading: false 
          });
        } else {
          set({ 
            error: response.error?.message || 'Failed to create certificate request',
            loading: false 
          });
        }
        return false;
      }
    } catch (error) {
      set({ 
        error: 'Certificate service is not yet available. Please try again later.',
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
        // Handle endpoint not ready gracefully
        if (response.error?.status === 404 || response.error?.message?.includes('not found')) {
          set({ 
            error: 'Approval service is not yet available. Please try again later.',
            loading: false 
          });
        } else {
          set({ 
            error: response.error?.message || 'Failed to approve certificate request',
            loading: false 
          });
        }
        return false;
      }
    } catch (error) {
      set({ 
        error: 'Approval service is not yet available. Please try again later.',
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
        // Handle endpoint not ready gracefully
        if (response.error?.status === 404 || response.error?.message?.includes('not found')) {
          set({ 
            error: 'Rejection service is not yet available. Please try again later.',
            loading: false 
          });
        } else {
          set({ 
            error: response.error?.message || 'Failed to reject certificate request',
            loading: false 
          });
        }
        return false;
      }
    } catch (error) {
      set({ 
        error: 'Rejection service is not yet available. Please try again later.',
        loading: false 
      });
      return false;
    }
  },

  reset: () => set(initialState),
}));

