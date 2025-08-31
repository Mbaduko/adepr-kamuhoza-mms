import { create } from 'zustand';
import { ZoneService, Zone } from '@/services/zoneService';

interface ZonesState {
  zones: Zone[];
  loading: boolean;
  error: string | null;
  selectedZone: Zone | null;
  isInitialized: boolean;
}

interface ZonesActions {
  // State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedZone: (zone: Zone | null) => void;
  
  // Actions
  fetchAllZones: () => Promise<void>;
  fetchZoneById: (id: string) => Promise<void>;
  
  // Reset
  reset: () => void;
}

const initialState: ZonesState = {
  zones: [],
  loading: false,
  error: null,
  selectedZone: null,
  isInitialized: false,
};

export const useZonesStore = create<ZonesState & ZonesActions>((set, get) => ({
  ...initialState,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedZone: (zone) => set({ selectedZone: zone }),

  fetchAllZones: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await ZoneService.getAllZones();
      
      if (response.success && response.data) {
        set({ zones: response.data, loading: false, isInitialized: true });
      } else {
        // Handle endpoint not ready gracefully
        if (response.error?.status === 404 || response.error?.message?.includes('not found')) {
          set({ 
            zones: [], 
            loading: false, 
            error: null, // Don't show error for endpoint not ready
            isInitialized: true 
          });
        } else {
          set({ 
            error: response.error?.message || 'Failed to fetch zones',
            loading: false,
            isInitialized: true
          });
        }
      }
    } catch (error) {
      // Handle network errors gracefully
      set({ 
        zones: [],
        error: null, // Don't show network errors as they might be expected
        loading: false,
        isInitialized: true
      });
    }
  },

  fetchZoneById: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await ZoneService.getZoneById(id);
      
      if (response.success && response.data) {
        set({ selectedZone: response.data, loading: false, isInitialized: true });
      } else {
        // Handle endpoint not ready gracefully
        if (response.error?.status === 404 || response.error?.message?.includes('not found')) {
          set({ 
            selectedZone: null, 
            loading: false, 
            error: null,
            isInitialized: true
          });
        } else {
          set({ 
            error: response.error?.message || 'Failed to fetch zone details',
            loading: false,
            isInitialized: true
          });
        }
      }
    } catch (error) {
      set({ 
        selectedZone: null,
        error: null,
        loading: false,
        isInitialized: true
      });
    }
  },

  reset: () => set(initialState),
}));
