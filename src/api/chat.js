import api from './client';

export async function getMessages(matchId) {
  const { data } = await api.get(`/chat/${matchId}/messages/`);
  return data;
}

export async function sendMessage(matchId, message) {
  const { data } = await api.post(`/chat/${matchId}/messages/`, { message });
  return data;
}

export async function getThreads() {
  const { data } = await api.get('/chat/threads/');
  return data;
}
