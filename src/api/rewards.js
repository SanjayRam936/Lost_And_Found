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

// Razorpay: create an order for the set amount.
export async function createOrder(claimId) {
  const { data } = await api.post(`/reward/${claimId}/order/`);
  return data;
}

// Razorpay: verify the checkout signature server-side (releases the reward).
export async function verifyPayment(claimId, payload) {
  const { data } = await api.post(`/reward/${claimId}/verify/`, payload);
  return data;
}

// Mock payment confirmation — fallback for the demo when Razorpay isn't configured.
export async function confirmRewardPayment(claimId) {
  const { data } = await api.post('/reward/webhook/confirm/', { claim_id: claimId });
  return data;
}

// Load the Razorpay Checkout script once.
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}
