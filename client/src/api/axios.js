import axios from 'axios';

// Relative by default: the Vite dev proxy serves /api locally and the Vercel
// rewrite serves it in production. Override with VITE_API_URL if needed.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only an expired/invalid session should bounce to /login. A 401 from the
    // sign-in form itself (wrong password) must reach the page as an error.
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.status === 413) return 'That file is too large to upload.';
  if (error?.response?.status === 429) return 'Too many requests. Please wait a moment and try again.';
  return error?.response?.data?.error || (error?.response ? fallback : error?.message || fallback);
}

export default api;
