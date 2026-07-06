import api from './client';

export async function getReward(claimId) {
  const { data } = await api.get(`/reward/${claimId}/`);
  return data;
}

export async function setRewardAmount(claimId, amount) {
  const { data } = await api.put(`/reward/${claimId}/`, { amount });
  return data;
}

export async function getRewardLink(claimId) {
  const { data } = await api.get(`/reward/${claimId}/link/`);
  return data;
}

// Owner confirms they've sent the UPI payment -> backend emails/notifies the
// finder a 6-digit OTP to confirm receipt (reward moves to AWAITING).
export async function initiateReward(claimId) {
  const { data } = await api.post(`/reward/${claimId}/initiate/`);
  return data;
}

// Finder enters the OTP to confirm they received the money (-> RELEASED).
export async function confirmRewardOtp(claimId, otp) {
  const { data } = await api.post(`/reward/${claimId}/confirm/`, { otp });
  return data;
}
