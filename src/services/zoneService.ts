import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types/auth';

export interface Zone {
  id: string;
  name: string;
  leaderId?: string;
  description: string;
  memberCount: number;
  created_at: string;
  updated_at: string;
}

// API Response structure for GET /zones/
// Expected response: Array of zones with the following structure:
// {
//   "id": "string",
//   "name": "string", 
//   "description": "string",
//   "zone_leader_id": "string" (optional),
//   "created_at": "string",
//   "updated_at": "string"
// }

export interface ZoneApiResponse {
  id: string;
  name: string;
  description: string;
  zone_leader_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateZoneData {
  name: string;
  description: string;
  zone_leader_id?: string;
}

export interface CreateZoneResponse {
  id: string;
  name: string;
  description: string;
  zone_leader_id: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateZoneData {
  name: string;
  description: string;
  zone_leader_id?: string;
}

export interface UpdateZoneResponse {
  id: string;
  name: string;
  description: string;
  zone_leader_id?: string;
  created_at: string;
  updated_at: string;
}

export class ZoneService {
  /**
   * Get all zones
   */
  static async getAllZones(): Promise<ApiResponse<ZoneApiResponse[]>> {
    try {
      const response = await apiClient.get<ZoneApiResponse[]>('/zones/');
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to fetch zones. Please check your internet connection and try again.',
          status: 0,
        },
      };
    }
  }

  /**
   * Get zone by ID
   */
  static async getZoneById(id: string): Promise<ApiResponse<ZoneApiResponse>> {
    try {
      const response = await apiClient.get<ZoneApiResponse>(`/zones/${id}`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to fetch zone details. Please check your internet connection and try again.',
          status: 0,
        },
      };
    }
  }

  /**
   * Create a new zone
   */
  static async createZone(zoneData: CreateZoneData): Promise<ApiResponse<CreateZoneResponse>> {
    try {
      const response = await apiClient.post<CreateZoneResponse>('/zones/', zoneData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Unable to create zone. Please try again.',
          status: error.response?.status || 0,
        },
      };
    }
  }

  /**
   * Update zone by ID
   */
  static async updateZone(id: string, zoneData: UpdateZoneData): Promise<ApiResponse<UpdateZoneResponse>> {
    try {
      const response = await apiClient.put<UpdateZoneResponse>(`/zones/${id}`, zoneData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Unable to update zone. Please try again.',
          status: error.response?.status || 0,
        },
      };
    }
  }
}
