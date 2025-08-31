import { apiClient } from '@/lib/api';
import { LoginRequest, LoginResponse, UserProfileResponse, ApiResponse } from '@/types/auth';

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('AuthService: Attempting login...');
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      console.log('AuthService: Login response:', response);
      
      if (response.success && response.data) {
        console.log('AuthService: Login successful, storing token and user data...');
        // Store the access_token and user data in localStorage
        apiClient.setToken(response.data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        console.log('AuthService: Token and user data stored successfully');
      }
      
      return response;
    } catch (error) {
      console.error('AuthService: Login error:', error);
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
  static async refreshToken(): Promise<ApiResponse<{ access_token: string }>> {
    try {
      const response = await apiClient.post<{ access_token: string }>('/auth/refresh');
      
      if (response.success && response.data) {
        apiClient.setToken(response.data.access_token);
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
