import api from './client';

export const getStats = () => api.get('/admin/stats/').then((r) => r.data);
export const getUsers = () => api.get('/admin/users/').then((r) => r.data);
export const getItems = () => api.get('/admin/items/').then((r) => r.data);
export const getMatches = () => api.get('/admin/matches/').then((r) => r.data);
export const getClaims = () => api.get('/admin/claims/').then((r) => r.data);
export const getRewards = () => api.get('/admin/rewards/').then((r) => r.data);
