import api from './client';

export async function initiateClaim(matchId) {
  const { data } = await api.post(`/claims/initiate/${matchId}/`);
  return data;
}

// Feature 2 — ownership verification. On success the backend generates the OTP.
export async function verifyOwnership(matchId, answers) {
  const { data } = await api.post(`/claims/verify-ownership/${matchId}/`, answers);
  return data;
}

export async function getClaim(claimId) {
  const { data } = await api.get(`/claims/${claimId}/`);
  return data;
}

export async function verifyOtp(claimId, otp) {
  const { data } = await api.post(`/claims/${claimId}/otp/verify/`, { otp });
  return data;
}

export async function regenerateOtp(claimId) {
  const { data } = await api.post(`/claims/${claimId}/otp/regenerate/`);
  return data;
}
