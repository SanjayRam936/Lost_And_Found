import api from './client';

// Visible matches for one of my lost items (richest confidence first).
export async function matchesForLost(lostPk) {
  const { data } = await api.get(`/matches/for-lost/${lostPk}/`);
  return data;
}

// Every match I can see (Vivar Adar), with item details.
export async function myMatches() {
  const { data } = await api.get('/matches/mine/');
  return data;
}

export async function dismissMatch(matchId) {
  await api.post(`/matches/dismiss/${matchId}/`);
}
