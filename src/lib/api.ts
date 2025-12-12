// API configuration
const getApiBaseUrl = () => {
  // In development and production, use relative paths
  // Netlify redirects handle routing /api/* to functions
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

