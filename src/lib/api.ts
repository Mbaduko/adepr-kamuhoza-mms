import { ApiResponse, ApiError } from '@/types/auth';
import { API_CONFIG } from '@/config/api';

// Helper function to create a timeout promise
const createTimeoutPromise = (timeoutMs: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });
};

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`, {
        headers: options.headers,
        body: options.body,
      });
    }
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authorization header if token exists
    const token = this.getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      // Add timeout to the request
      const response = await Promise.race([
        fetch(url, config),
        createTimeoutPromise(API_CONFIG.TIMEOUT)
      ]);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        const error: ApiError = {
          message: `Unexpected response format: ${text}`,
          status: response.status,
        };
        return { success: false, error };
      }

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          errors: data.errors,
        };
        return { success: false, error };
      }

      // Log successful response in development
      if (import.meta.env.DEV) {
        console.log(`✅ API Response: ${options.method || 'GET'} ${url}`, {
          status: response.status,
          data: data,
        });
      }

      return { success: true, data };
    } catch (error) {
      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error: ${options.method || 'GET'} ${url}`, error);
      }

      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
      };
      return { success: false, error: apiError };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Token management
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_CONFIG.BASE_URL);
