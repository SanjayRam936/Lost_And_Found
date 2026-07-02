import axios from 'axios';

// --- Token storage (localStorage) -------------------------------------------
const ACCESS_KEY = 'lf_access';
const REFRESH_KEY = 'lf_refresh';

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set({ access, refresh }) {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// --- API base URL -----------------------------------------------------------
// In local dev this is empty, so requests go to "/api/v1/..." and the Vite
// proxy forwards them to Django. In production set VITE_API_URL to the deployed
// backend origin (e.g. https://your-space.hf.space).
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const API_ROOT = `${API_BASE}/api/v1`;

// --- Axios instance ---------------------------------------------------------
const api = axios.create({ baseURL: API_ROOT });

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, transparently refresh the access token once and replay the request.
// A single in-flight refresh is shared across concurrent 401s.
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error;

    if (!response || response.status !== 401 || config?._retry) {
      return Promise.reject(error);
    }
    // Never try to refresh the refresh/login endpoints themselves.
    if (config.url?.includes('/token/refresh/') || config.url?.includes('/login/')) {
      return Promise.reject(error);
    }
    const refresh = tokenStore.refresh;
    if (!refresh) {
      forceLogout();
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      refreshing =
        refreshing || axios.post(`${API_ROOT}/token/refresh/`, { refresh });
      const { data } = await refreshing;
      refreshing = null;
      tokenStore.set({ access: data.access, refresh: data.refresh });
      config.headers.Authorization = `Bearer ${data.access}`;
      return api(config);
    } catch (refreshErr) {
      refreshing = null;
      forceLogout();
      return Promise.reject(refreshErr);
    }
  }
);

// Clear tokens and let the app react (AppContext listens for this).
function forceLogout() {
  tokenStore.clear();
  window.dispatchEvent(new Event('lf:logout'));
}

// Normalise a DRF error response into a single human-readable string.
export function apiError(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  const first = Object.values(data)[0];
  if (Array.isArray(first)) return first[0];
  if (typeof first === 'string') return first;
  return fallback;
}

export default api;
