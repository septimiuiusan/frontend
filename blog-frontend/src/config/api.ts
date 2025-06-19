// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    LOGIN: '/api/login',
    SIGNUP: '/api/signup',
    ORDERS: '/api/orders',
    RESERVATIONS: '/api/reservations',
    CONTACTS: '/api/contacts',
    FEEDBACK: '/api/feedback',
    FEEDBACKS: '/api/feedbacks',
    USERS: '/api/users',
    ADMIN_FEEDBACKS: '/api/admin/feedbacks',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
