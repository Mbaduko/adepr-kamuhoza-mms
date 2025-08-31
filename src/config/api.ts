// API Configuration
// Environment variables should be set in .env file

export const API_CONFIG = {
  BASE_URL: import.meta.env.DEV 
    ? '/api' // Use proxy during development
    : import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// Environment check
if (!import.meta.env.VITE_API_BASE_URL && !import.meta.env.DEV) {
  console.error('VITE_API_BASE_URL is not set in production environment. Please check your .env file.');
  throw new Error('VITE_API_BASE_URL environment variable is required in production');
}

// Log the API configuration in development
if (import.meta.env.DEV) {
  console.log('API Configuration:', API_CONFIG);
}
