import api, { tokenStore } from './client';

// Register -> backend returns { user, access, refresh } and logs the user in.
export async function register({ full_name, email, phone_number, password, password2 }) {
  const { data } = await api.post('/register/', {
    full_name,
    email,
    phone_number,
    password,
    password2,
  });
  tokenStore.set({ access: data.access, refresh: data.refresh });
  return data.user;
}

// Login -> { user, access, refresh }.
export async function login(email, password) {
  const { data } = await api.post('/login/', { email, password });
  tokenStore.set({ access: data.access, refresh: data.refresh });
  return data.user;
}

// Logout -> blacklist the refresh token, then clear local tokens.
export async function logout() {
  const refresh = tokenStore.refresh;
  try {
    if (refresh) await api.post('/logout/', { refresh });
  } catch {
    // Even if the server call fails, we still drop local tokens below.
  } finally {
    tokenStore.clear();
  }
}

// Current authenticated user's profile.
export async function getMe() {
  const { data } = await api.get('/me/');
  return data;
}

export async function updateProfile(patch) {
  const { data } = await api.patch('/me/', patch);
  return data;
}

export async function changePassword(old_password, new_password) {
  const { data } = await api.post('/change-password/', {
    old_password,
    new_password,
  });
  return data;
}

export function hasSession() {
  return Boolean(tokenStore.refresh);
}
