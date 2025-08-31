import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types/auth';

export interface Zone {
  id: string;
  name: string;
  leaderId?: string;
  description: string;
  memberCount: number;
}

export class ZoneService {
  /**
   * Get all zones
   */
  static async getAllZones(): Promise<ApiResponse<Zone[]>> {
    try {
      const response = await apiClient.get<Zone[]>('/zones');
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
  static async getZoneById(id: string): Promise<ApiResponse<Zone>> {
    try {
      const response = await apiClient.get<Zone>(`/zones/${id}`);
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
}
