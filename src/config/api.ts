// Configuration for API endpoints
// Custom backend API configuration

export const API_CONFIG = {
  // Custom Backend API URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // API Endpoints
  ENDPOINTS: {
    CATEGORIES: '/categories',
    PRODUCTS: '/products',
    ORDERS: '/orders',
    UPLOAD: '/upload',
    AUTH: '/auth'
  }
} as const;
