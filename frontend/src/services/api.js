import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    let message = 'An error occurred';
    if (typeof detail === 'string') {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail.map(d => d.msg).join(', ');
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

// Products API
export const productsApi = {
  getAll: (params = {}) => api.get('/products', { params }).then(r => r.data),
  getById: (id) => api.get(`/products/${id}`).then(r => r.data),
  create: (data) => api.post('/products', data).then(r => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Customers API
export const customersApi = {
  getAll: (params = {}) => api.get('/customers', { params }).then(r => r.data),
  getById: (id) => api.get(`/customers/${id}`).then(r => r.data),
  create: (data) => api.post('/customers', data).then(r => r.data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: (params = {}) => api.get('/orders', { params }).then(r => r.data),
  getById: (id) => api.get(`/orders/${id}`).then(r => r.data),
  create: (data) => api.post('/orders', data).then(r => r.data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard').then(r => r.data),
};

export default api;
