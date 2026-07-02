import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { IndianRupee, CheckCircle } from 'lucide-react';
import * as rewardsApi from '../api/rewards';

export const FinderReward = () => {
  const { navigateTo, currentClaim } = useAppContext();
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!currentClaim?.id) { setLoading(false); return; }
      try {
        setReward(await rewardsApi.getReward(currentClaim.id));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [currentClaim]);

  if (loading) return <div className="dashboard-wrapper"><div className="dashboard-container" style={{ textAlign: 'center', padding: '3rem' }}>Loading…</div></div>;

  const released = reward?.escrow_status === 'RELEASED';

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Reward Claim</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
            {released ? 'The owner has released your reward.' : 'Awaiting the owner to send the reward.'}
          </p>
        </div>

        <div className="white-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderTop: `4px solid ${released ? '#10B981' : 'var(--border-light)'}` }}>
          <Row label="Item" value={reward?.item_title || '—'} />
          <Row label="Owner" value={reward?.owner_name || '—'} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
            <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Status</span>
            <span style={{ fontWeight: '700', color: released ? '#10B981' : 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {released && <CheckCircle size={16} />} {released ? 'Released' : 'Pending Payment'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-gray)', fontWeight: '600', fontSize: '1.1rem' }}>Total Reward</span>
            <span style={{ fontWeight: '800', color: '#10B981', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
              <IndianRupee size={20} /> {Number(reward?.amount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

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
