import api from './client';

export async function listNotifications() {
  const { data } = await api.get('/notifications/');
  return data;
}

export async function markAllRead() {
  await api.post('/notifications/mark-all-read/');
}

export async function markRead(id) {
  await api.post(`/notifications/${id}/mark-read/`);
}
