import { create } from 'zustand';
import { MemberService, Member, ZoneMemberResponse } from '@/services/memberService';

interface MembersState {
  members: Member[];
  zones: Array<{ id: string; name: string }>;
  loading: boolean;
  error: string | null;
  selectedMember: Member | null;
  isInitialized: boolean;
  totalMembers: number;
  accessLevel: string;
}

interface MembersActions {
  // State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedMember: (member: Member | null) => void;
  
  // Actions
  fetchAllMembers: () => Promise<void>;
  fetchZoneMembers: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  fetchMembersByZone: (zoneId: string) => Promise<void>;
  fetchMemberById: (id: string) => Promise<void>;
  
  // Reset
  reset: () => void;
}

const initialState: MembersState = {
  members: [],
  zones: [],
  loading: false,
  error: null,
  selectedMember: null,
  isInitialized: false,
  totalMembers: 0,
  accessLevel: '',
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

  fetchZoneMembers: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await MemberService.getZoneMembers();
      
      if (response.success && response.data) {
        // Convert API response to our Member interface
        const convertedMembers: Member[] = response.data.members.map(member => ({
          id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email,
          phone: member.phone_number,
          dateOfBirth: member.date_of_birth,
          gender: member.gender.toLowerCase() as 'male' | 'female',
          maritalStatus: member.marital_status.toLowerCase() as 'single' | 'married' | 'divorced' | 'widowed',
          address: '', // Not provided in API response
          zoneId: member.zone_id || '',
          isChoirMember: false, // Not provided in API response
          accountStatus: member.account_status.toLowerCase() as 'active' | 'inactive',
          profileImage: '', // Not provided in API response
          sacraments: {
            baptism: undefined,
            recommendation: undefined,
            marriage: undefined,
          },
        }));

        set({ 
          members: convertedMembers,
          zones: response.data.zones,
          totalMembers: response.data.total,
          accessLevel: response.data.access_level,
          loading: false, 
          isInitialized: true 
        });
      } else {
        // Handle endpoint not ready gracefully
        if (response.error?.status === 404 || response.error?.message?.includes('not found')) {
          set({ 
            members: [],
            zones: [],
            totalMembers: 0,
            accessLevel: '',
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
        zones: [],
        totalMembers: 0,
        accessLevel: '',
        error: null,
        loading: false,
        isInitialized: true
      });
    }
  },

  fetchAllUsers: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await MemberService.getAllUsers();
      
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
            error: response.error?.message || 'Failed to fetch all users',
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
