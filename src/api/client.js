import axios from 'axios';

/**
 * Central Axios instance — single source of truth for the backend URL,
 * JWT injection, and auth-failure handling.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://forijat.onrender.com/api/v1',
  timeout: 20000,
});

// Attach the admin JWT automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('forijat_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401/403: clear the session and bounce back to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('forijat_admin_token');
      localStorage.removeItem('forijat_admin_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
