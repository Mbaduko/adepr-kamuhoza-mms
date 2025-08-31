import { create } from 'zustand';
import { MemberService, Member } from '@/services/memberService';

interface MembersState {
  members: Member[];
  loading: boolean;
  error: string | null;
  selectedMember: Member | null;
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
        set({ members: response.data, loading: false });
      } else {
        set({ 
          error: response.error?.message || 'Failed to fetch members',
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Network error occurred while fetching members',
        loading: false 
      });
    }
  },

  fetchMembersByZone: async (zoneId: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await MemberService.getMembersByZone(zoneId);
      
      if (response.success && response.data) {
        set({ members: response.data, loading: false });
      } else {
        set({ 
          error: response.error?.message || 'Failed to fetch zone members',
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Network error occurred while fetching zone members',
        loading: false 
      });
    }
  },

  fetchMemberById: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await MemberService.getMemberById(id);
      
      if (response.success && response.data) {
        set({ selectedMember: response.data, loading: false });
      } else {
        set({ 
          error: response.error?.message || 'Failed to fetch member details',
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Network error occurred while fetching member details',
        loading: false 
      });
    }
  },

  reset: () => set(initialState),
}));
