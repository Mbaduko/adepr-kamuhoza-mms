import { create } from 'zustand';
import { MemberService, Member, ZoneMemberResponse } from '@/services/memberService';
import { Members } from '@/pages/Members';

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
      const response = await MemberService.getZoneMembers();
      if (response.success && response.data) {
        const allMembers: Member[] = response.data.zones.flatMap(zone =>
          zone.members.map(raw => ({
            id: raw.profile_id,
            name: `${raw.first_name} ${raw.last_name}`,
            email: raw.user?.email ?? '',
            phone: raw.phone_number,
            gender: raw.gender,
            dateOfBirth: raw.date_of_birth,
            choir: raw.choir,
            address: raw.address,
            highestDegree: raw.highest_degree,
            maritalStatus: raw.marital_status,
            zoneId: zone.zone_id,
            isChoirMember: !!raw.choir,
            accountStatus: String(raw.user.account_status).toUpperCase() as 'ACTIVE' | 'INACTIVE',
            authId: raw.user?.auth_id,
            role: raw.user?.role,
            sacraments: {
              baptism: { date: raw.baptism_date },
              marriage: raw.marital_status === 'married'
                ? { date: raw.marriage_date ?? '', place: raw.is_married_in_church ? 'Muhoza ADEPR' : 'Elsewhere' }
                : undefined,
            },
            profileImage: raw.photo ?? undefined,
          }))
        );
        set({
          members: allMembers,
          zones: response.data.zones.map(zone => ({ id: zone.zone_id, name: zone.zone_name })),
          totalMembers: response.data.total_members,
          accessLevel: response.data.access_level,
          loading: false,
          isInitialized: true,
        });
      } else {
        const isNotFound = response.error?.status === 404 || response.error?.message?.includes('not found');
        set(isNotFound
          ? {
              members: [],
              zones: [],
              totalMembers: 0,
              accessLevel: '',
              loading: false,
              error: null,
              isInitialized: true,
            }
          : {
              error: response.error?.message || 'Failed to fetch members',
              loading: false,
              isInitialized: true,
            }
        );
      }
    } catch {
      set({
        members: [],
        zones: [],
        totalMembers: 0,
        accessLevel: '',
        error: null,
        loading: false,
        isInitialized: true,
      });
    }
  },

  fetchMembersByZone: async (zoneId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await MemberService.getMembersByZone(zoneId);
      if (response.success && response.data) {
        set({
          members: response.data,
          loading: false,
          isInitialized: true,
        });
      } else {
        const isNotFound = response.error?.status === 404 || response.error?.message?.includes('not found');
        set(isNotFound
          ? {
              members: [],
              loading: false,
              error: null,
              isInitialized: true,
            }
          : {
              error: response.error?.message || 'Failed to fetch zone members',
              loading: false,
              isInitialized: true,
            }
        );
      }
    } catch {
      set({
        members: [],
        error: null,
        loading: false,
        isInitialized: true,
      });
    }
  },

  fetchMemberById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await MemberService.getMemberById(id);
      if (response.success && response.data) {
        set({
          selectedMember: response.data,
          loading: false,
          isInitialized: true,
        });
      } else {
        const isNotFound = response.error?.status === 404 || response.error?.message?.includes('not found');
        set(isNotFound
          ? {
              selectedMember: null,
              loading: false,
              error: null,
              isInitialized: true,
            }
          : {
              error: response.error?.message || 'Failed to fetch member details',
              loading: false,
              isInitialized: true,
            }
        );
      }
    } catch {
      set({
        selectedMember: null,
        error: null,
        loading: false,
        isInitialized: true,
      });
    }
  },

  reset: () => set(initialState),
}));
