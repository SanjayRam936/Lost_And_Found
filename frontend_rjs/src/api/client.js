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
// PRIMARY: where API calls go by default.
//   - Local dev: VITE_API_URL is empty, so calls hit "/api/v1/..." and the Vite
//     proxy forwards them to the local Django on :8000.
//   - Production build (Vercel): VITE_API_URL is the HF Space, used directly.
// FALLBACK: the deployed HF Space backend. In local dev, if the local backend
// isn't running, initApiBase() reroutes every call to this automatically.
const stripSlash = (s) => (s || '').replace(/\/$/, '');
const PRIMARY = stripSlash(import.meta.env.VITE_API_URL);
const FALLBACK = stripSlash(import.meta.env.VITE_FALLBACK_API_URL);

const rootFor = (origin) => `${origin}/api/v1`;

// --- Axios instance ---------------------------------------------------------
const api = axios.create({ baseURL: rootFor(PRIMARY) });

// Probe the local backend once at startup; if it's down (and a remote fallback
// is configured), route all calls to the HF Space instead. Only matters in
// local dev — in production PRIMARY already points at the deployed backend.
let apiBaseReady = null;
export function initApiBase() {
  if (!apiBaseReady) {
    apiBaseReady = (async () => {
      if (PRIMARY || !FALLBACK) return;          // prod, or nothing to fall back to
      const localUp = await probe(rootFor(''));
      if (!localUp) {
        api.defaults.baseURL = rootFor(FALLBACK);
        // eslint-disable-next-line no-console
        console.info('[api] Local backend not reachable — using HF Space:', FALLBACK);
      }
    })();
  }
  return apiBaseReady;
}

async function probe(root) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`${root}/health/`, { signal: ctrl.signal, credentials: 'omit' });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

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
        refreshing || axios.post(`${api.defaults.baseURL}/token/refresh/`, { refresh });
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
