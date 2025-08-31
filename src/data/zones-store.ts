import { create } from 'zustand';
import { ZoneService, Zone, ZoneApiResponse } from '@/services/zoneService';

// Helper function to convert API response to internal Zone interface
const convertApiZoneToZone = (apiZone: ZoneApiResponse): Zone => {
  return {
    id: apiZone.id,
    name: apiZone.name,
    leaderId: apiZone.zone_leader_id,
    description: apiZone.description,
    memberCount: 0, // This will be calculated separately based on members data
  };
};

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
  updateZone: (id: string, zoneData: any) => Promise<void>;
  
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
        // Convert API response to internal Zone interface
        const zones = response.data.map(convertApiZoneToZone);
        set({ zones, loading: false, isInitialized: true });
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
        // Convert API response to internal Zone interface
        const zone = convertApiZoneToZone(response.data);
        set({ selectedZone: zone, loading: false, isInitialized: true });
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

  updateZone: async (id: string, zoneData: any) => {
    set({ loading: true, error: null });
    try {
      const response = await ZoneService.updateZone(id, zoneData);
      if (response.success && response.data) {
        // Re-fetch the zone to update the store
        const updatedZone = convertApiZoneToZone(response.data);
        set(prev => ({
          zones: prev.zones.map(zone => zone.id === id ? updatedZone : zone),
          selectedZone: updatedZone,
          loading: false,
          isInitialized: true
        }));
      } else {
        set({
          error: response.error?.message || 'Failed to update zone',
          loading: false,
          isInitialized: true
        });
      }
    } catch (error) {
      set({
        error: null, // Don't show network errors as they might be expected
        loading: false,
        isInitialized: true
      });
    }
  },

  reset: () => set(initialState),
}));
