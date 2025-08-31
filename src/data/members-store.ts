import { create } from 'zustand';
import { MemberService, Member } from '@/services/memberService';

interface MembersState {
  members: Member[];
  loading: boolean;
  error: string | null;
  selectedMember: Member | null;
  isInitialized: boolean;
}

interface MembersActions {
  // State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedMember: (member: Member | null) => void;
  
  // Actions
  fetchAllMembers: () => Promise<void>;
  fetchMembersByZone: (zoneId: string) => Promise<void>;
  fetchMemberById: (id: string) => Promise<void>;
  
  // Reset
  reset: () => void;
}

const initialState: MembersState = {
  members: [],
  loading: false,
  error: null,
  selectedMember: null,
  isInitialized: false,
};

export const useMembersStore = create<MembersState & MembersActions>((set, get) => ({
  ...initialState,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedMember: (member) => set({ selectedMember: member }),

  fetchAllMembers: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await MemberService.getAllMembers();
      
      if (response.success && response.data) {
        set({ members: response.data, loading: false, isInitialized: true });
      } else {
        // Handle endpoint not ready gracefully
        if (response.error?.status === 404 || response.error?.message?.includes('not found')) {
          set({ 
            members: [], 
            loading: false, 
            error: null, // Don't show error for endpoint not ready
            isInitialized: true 
          });
        } else {
          set({ 
            error: response.error?.message || 'Failed to fetch members',
            loading: false,
            isInitialized: true
          });
        }
      }
    } catch (error) {
      // Handle network errors gracefully
      set({ 
        members: [],
        error: null, // Don't show network errors as they might be expected
        loading: false,
        isInitialized: true
      });
    }
  },

  fetchMembersByZone: async (zoneId: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await MemberService.getMembersByZone(zoneId);
      
      if (response.success && response.data) {
        set({ members: response.data, loading: false, isInitialized: true });
      } else {
        // Handle endpoint not ready gracefully
        if (response.error?.status === 404 || response.error?.message?.includes('not found')) {
          set({ 
            members: [], 
            loading: false, 
            error: null,
            isInitialized: true
          });
        } else {
          set({ 
            error: response.error?.message || 'Failed to fetch zone members',
            loading: false,
            isInitialized: true
          });
        }
      }
    } catch (error) {
      set({ 
        members: [],
        error: null,
        loading: false,
        isInitialized: true
      });
    }
  },

  fetchMemberById: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await MemberService.getMemberById(id);
      
      if (response.success && response.data) {
        set({ selectedMember: response.data, loading: false, isInitialized: true });
      } else {
        // Handle endpoint not ready gracefully
        if (response.error?.status === 404 || response.error?.message?.includes('not found')) {
          set({ 
            selectedMember: null, 
            loading: false, 
            error: null,
            isInitialized: true
          });
        } else {
          set({ 
            error: response.error?.message || 'Failed to fetch member details',
            loading: false,
            isInitialized: true
          });
        }
      }
    } catch (error) {
      set({ 
        selectedMember: null,
        error: null,
        loading: false,
        isInitialized: true
      });
    }
  },

  reset: () => set(initialState),
}));
