import axios from 'axios';
import authHeader from './auth.header';
import authService from './auth.service';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth header before each request
api.interceptors.request.use(async (config) => {
  try {
    const headers = await authHeader();
    config.headers = { ...(config.headers || {}), ...headers };
  } catch (_e) {
    // ignore
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 Unauthorized globally: clear stale token and reload (forces signin)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      if (error && error.response && error.response.status === 401) {
        // Clear stored user/token
        try { await authService.logout(); } catch (_) {}
        // If running in a browser, reload to force signin flow
        if (typeof window !== 'undefined' && window.location) {
          window.location.reload();
        }
      }
    } catch (_) {}
    return Promise.reject(error);
  }
);

export default api;
