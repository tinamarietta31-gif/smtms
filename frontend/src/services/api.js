import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  firebaseLogin: (data) => api.post('/auth/firebase', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// Vehicles
export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  stop: (id) => api.post(`/vehicles/${id}/stop`),
  resume: (id) => api.post(`/vehicles/${id}/resume`),
};

// Trips
export const tripAPI = {
  getAll: (params) => api.get('/trips', { params }),
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
};

// Violations
export const violationAPI = {
  getAll: (params) => api.get('/violations', { params }),
  getById: (id) => api.get(`/violations/${id}`),
  create: (data) => api.post('/violations', data),
  generateChallan: (id) => api.post(`/violations/${id}/challan`),
  resolve: (id) => api.put(`/violations/${id}/resolve`),
};

// Alerts
export const alertAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  resolve: (id, data) => api.put(`/alerts/${id}/resolve`, data),
};

// Permits
export const permitAPI = {
  getAll: (params) => api.get('/permits', { params }),
  getById: (id) => api.get(`/permits/${id}`),
  create: (data) => api.post('/permits', data),
  update: (id, data) => api.put(`/permits/${id}`, data),
  revoke: (id) => api.put(`/permits/${id}/revoke`),
};

// Geofences
export const geofenceAPI = {
  getAll: (params) => api.get('/geofences', { params }),
  create: (data) => api.post('/geofences', data),
  update: (id, data) => api.put(`/geofences/${id}`, data),
  delete: (id) => api.delete(`/geofences/${id}`),
};

// Analytics
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getViolationStats: () => api.get('/analytics/violations'),
  getPredictions: () => api.get('/analytics/predictions'),
  getRecentActivity: () => api.get('/analytics/recent'),
};

// Infrastructure (Toll Plazas, Traffic Signals, Checkpoints)
export const infrastructureAPI = {
  getAll: (params) => api.get('/infrastructure', { params }),
  getStats: () => api.get('/infrastructure/stats'),
  seed: () => api.post('/infrastructure/seed'),
  getLogs: (params) => api.get('/infrastructure/logs', { params }),
  recordDetection: (data) => api.post('/infrastructure/detect', data),
  crossVerify: () => api.get('/infrastructure/cross-verify'),
};

export default api;
