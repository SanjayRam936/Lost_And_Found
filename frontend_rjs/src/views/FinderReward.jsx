import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { IndianRupee, CheckCircle, AlertTriangle, Wallet } from 'lucide-react';
import * as rewardsApi from '../api/rewards';
import { apiError } from '../api/client';

export const FinderReward = () => {
  const { navigateTo, currentClaim, user } = useAppContext();
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!currentClaim?.id) { setLoading(false); return; }
    try {
      setReward(await rewardsApi.getReward(currentClaim.id));
    } catch (err) {
      setError(apiError(err, 'Could not load reward.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [currentClaim]);

  const confirm = async () => {
    if (otp.trim().length < 6) { setError('Enter the 6-digit code.'); return; }
    setBusy(true); setError('');
    try {
      await rewardsApi.confirmRewardOtp(currentClaim.id, otp.trim());
      await load();
    } catch (err) {
      setError(apiError(err, 'Could not confirm. Check the code and try again.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="dashboard-wrapper"><div className="dashboard-container" style={{ textAlign: 'center', padding: '3rem' }}>Loading…</div></div>;

  const released = reward?.escrow_status === 'RELEASED';
  const awaiting = reward?.escrow_status === 'AWAITING';
  const hasUpi = Boolean(user?.upi_id);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Reward Claim</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
            {released ? 'You confirmed your reward. Case closed.' : awaiting ? 'The owner sent your reward — confirm you received it below.' : 'Awaiting the owner to send the reward.'}
          </p>
        </div>

        {/* Finder must add a UPI ID so the owner can pay them */}
        {!hasUpi && !released && (
          <div style={{ display: 'flex', gap: 12, padding: '1rem', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12, marginBottom: '1.5rem', alignItems: 'flex-start' }}>
            <Wallet size={20} color="#92400E" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.9rem' }}>Add your UPI ID</div>
              <div style={{ fontSize: '0.8rem', color: '#92400E', marginBottom: 8 }}>The owner needs your UPI ID to send the reward.</div>
              <button className="btn-card-action btn-green-solid" onClick={() => navigateTo('link-bank')}>Add UPI ID</button>
            </div>
          </div>
        )}

        <div className="white-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderTop: `4px solid ${released ? '#10B981' : 'var(--border-light)'}` }}>
          <Row label="Item" value={reward?.item_title || '—'} />
          <Row label="Owner" value={reward?.owner_name || '—'} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
            <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Status</span>
            <span style={{ fontWeight: '700', color: released ? '#10B981' : 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {released && <CheckCircle size={16} />} {released ? 'Released' : awaiting ? 'Confirm receipt' : 'Pending payment'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-gray)', fontWeight: '600', fontSize: '1.1rem' }}>Total Reward</span>
            <span style={{ fontWeight: '800', color: '#10B981', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
              <IndianRupee size={20} /> {Number(reward?.amount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* OTP confirmation — only when the owner has sent the payment */}
        {awaiting && (
          <div className="white-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: '1rem' }}>
              <AlertTriangle size={20} color="#B45309" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '0.85rem', color: '#92400E', fontWeight: 600, margin: 0 }}>
                Only if you actually received the ₹{Number(reward?.amount || 0).toLocaleString('en-IN')} payment, enter the confirmation code to complete the reward. The code was sent to your notifications.
              </p>
            </div>
            <input
              type="text" inputMode="numeric" maxLength={6}
              className="form-input" placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
              style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 }}
            />
            {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}
            <button className="btn-submit" style={{ width: '100%', marginTop: '1rem' }} disabled={busy || otp.length < 6} onClick={confirm}>
              {busy ? 'Confirming…' : 'Confirm I Received the Payment'}
            </button>
          </div>
        )}

        {!awaiting && error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}

        <button className="btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => navigateTo('dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
    <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>{label}</span>
    <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{value}</span>
  </div>
);
