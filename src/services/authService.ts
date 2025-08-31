import { apiClient } from '@/lib/api';
import { LoginRequest, LoginResponse, UserProfileResponse, ApiResponse } from '@/types/auth';

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        // Store the token and user data in localStorage
        apiClient.setToken(response.data.token);
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          status: 0,
        },
      };
    }
  }

  /**
   * Logout user and clear stored token
   */
  static logout(): void {
    apiClient.removeToken();
    localStorage.removeItem('auth_user');
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get the current authentication token
   */
  static getToken(): string | null {
    return apiClient.getToken();
  }

  /**
   * Get the current user data from localStorage
   */
  static getUser(): unknown {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get current user profile from API
   */
  static async getCurrentUser(): Promise<ApiResponse<UserProfileResponse>> {
    try {
      const response = await apiClient.get<UserProfileResponse>('/auth/me');
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Unable to fetch user profile. Please check your internet connection and try again.',
          status: 0,
        },
      };
    }
  }

  /**
   * Refresh authentication token (for future implementation)
   */
  static async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await apiClient.post<{ token: string }>('/auth/refresh');
      
      if (response.success && response.data) {
        apiClient.setToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Token refresh failed',
          status: 0,
        },
      };
    }
  }

  /**
   * Verify current token validity (for future implementation)
   */
  static async verifyToken(): Promise<ApiResponse<{ valid: boolean }>> {
    try {
      return await apiClient.get<{ valid: boolean }>('/auth/verify');
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Token verification failed',
          status: 0,
        },
      };
    }
  }
}
