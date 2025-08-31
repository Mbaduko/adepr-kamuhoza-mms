import { create } from 'zustand';
import { ZoneService, Zone } from '@/services/zoneService';

interface ZonesState {
  zones: Zone[];
  loading: boolean;
  error: string | null;
  selectedZone: Zone | null;
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
        set({ zones: response.data, loading: false });
      } else {
        set({ 
          error: response.error?.message || 'Failed to fetch zones',
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Network error occurred while fetching zones',
        loading: false 
      });
    }
  },

  fetchZoneById: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await ZoneService.getZoneById(id);
      
      if (response.success && response.data) {
        set({ selectedZone: response.data, loading: false });
      } else {
        set({ 
          error: response.error?.message || 'Failed to fetch zone details',
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Network error occurred while fetching zone details',
        loading: false 
      });
    }
  },

  reset: () => set(initialState),
}));
