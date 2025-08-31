// Authentication utilities for debugging and development

export const authUtils = {
  /**
   * Check what's stored in localStorage
   */
  debugStorage() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    
    console.log('🔍 Auth Storage Debug:');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('User:', user ? JSON.parse(user) : 'Missing');
    
    return { token, user: user ? JSON.parse(user) : null };
  },

  /**
   * Clear all authentication data
   */
  clearAll() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    console.log('🧹 Cleared all auth data');
  },

  /**
   * Check if authentication state is valid
   */
  isValidAuth() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    
    return !!(token && user);
  }
};
