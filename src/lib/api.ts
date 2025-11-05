// API configuration
const getApiBaseUrl = () => {
  // In development, use relative path (Vite proxy handles it)
  // In production, use the Render backend URL
  if (import.meta.env.DEV) {
    return '';
  }
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // Remove trailing slash if present
  return url.replace(/\/$/, '');
};

export const API_BASE_URL = getApiBaseUrl();

