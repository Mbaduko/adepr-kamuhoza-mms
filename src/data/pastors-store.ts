import { Pastors } from '@/pages/Pastors';
import { PastorData, PastorService } from '@/services/pastorService';
import { create } from 'zustand';

interface PastorsState {
  pastors: PastorData[];
  loading: boolean;
  error: string | null;
  selectedPastor: PastorData | null;
  isInitialized: boolean;
  totalPastors: number;
  accessLevel: string;
}

interface PastorsActions {
  // State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedPastor: (member: PastorData | null) => void;
  
  // Actions
  fetchAllPastors: () => Promise<void>;
//   fetchPastorById: (id: string) => Promise<void>;
  
  // Reset
  reset: () => void;
}

const initialState: PastorsState = {
  pastors: [],
  loading: false,
  error: null,
  selectedPastor: null,
  isInitialized: false,
  totalPastors: 0,
  accessLevel: '',
};

export const usePastorsStore = create<PastorsState & PastorsActions>((set, get) => ({
  ...initialState,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedPastor: (pastor) => set({ selectedPastor: pastor }),

  fetchAllPastors: async () => {
    set({ loading: true, error: null });
    try {
      const response = await PastorService.getPastors();
      if (response.success && response.data) {
        const allPastors: PastorData[] = response.data.pastors || [];
        set({
          pastors: allPastors,
          totalPastors: response.data.total ?? allPastors.length,
          accessLevel: response.data.access_level ?? '',
          loading: false,
          isInitialized: true,
        });
      } else {
        const isNotFound = response.error?.status === 404 || response.error?.message?.includes('not found');
        set(isNotFound
          ? {
              pastors: [],
              totalPastors: 0,
              accessLevel: '',
              loading: false,
              error: null,
              isInitialized: true,
            }
          : {
              error: response.error?.message || 'Failed to fetch pastors',
              loading: false,
              isInitialized: true,
            }
        );
      }
    } catch {
      set({
        pastors: [],
        totalPastors: 0,
        accessLevel: '',
        error: null,
        loading: false,
        isInitialized: true,
      });
    }
  },

//   fetchPastorById: async (id: string) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await PastorService.getPastorById(id);
//       if (response.success && response.data) {
//         set({
//           selectedPastor: response.data,
//           loading: false,
//           isInitialized: true,
//         });
//       } else {
//         const isNotFound = response.error?.status === 404 || response.error?.message?.includes('not found');
//         set(isNotFound
//           ? {
//               selectedPastor: null,
//               loading: false,
//               error: null,
//               isInitialized: true,
//             }
//           : {
//               error: response.error?.message || 'Failed to fetch pastor details',
//               loading: false,
//               isInitialized: true,
//             }
//         );
//       }
//     } catch {
//       set({
//         selectedPastor: null,
//         error: null,
//         loading: false,
//         isInitialized: true,
//       });
//     }
//   },

  reset: () => set(initialState),
}));
