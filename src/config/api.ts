// API Configuration
// You can modify this file to change the API base URL for different environments

export const API_CONFIG = {
  BASE_URL: import.meta.env.DEV 
    ? '/api' // Use proxy during development
    : (import.meta.env.VITE_API_BASE_URL || 'https://church-k6ws.onrender.com'),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// Environment check
if (!API_CONFIG.BASE_URL) {
  console.warn('VITE_API_BASE_URL is not set. Using default API URL.');
}

// Log the API configuration in development
if (import.meta.env.DEV) {
  console.log('API Configuration:', API_CONFIG);
}
