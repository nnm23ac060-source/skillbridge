import axios from 'axios';

/**
 * Central Axios instance.
 * - baseURL '/api' → proxied by Vite to the Express server in dev,
 *   same-origin in production.
 * - Attaches the JWT from localStorage on every request.
 * - Broadcasts 'sb:session-expired' when a real session dies (401).
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthCall && localStorage.getItem('sb_token')) {
      localStorage.removeItem('sb_token');
      window.dispatchEvent(new CustomEvent('sb:session-expired'));
    }
    return Promise.reject(error);
  }
);

/** Extract a human-readable message from an axios error. */
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.response?.data?.message || error?.message || fallback;

/** Extract field-level validation errors: { field: msg } */
export const getFieldErrors = (error) => {
  const list = error?.response?.data?.errors;
  if (!Array.isArray(list)) return {};
  return list.reduce((acc, e) => {
    if (e.field) acc[e.field] = e.msg;
    return acc;
  }, {});
};

export default api;
