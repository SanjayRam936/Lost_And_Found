import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Lock, CheckCircle, Smartphone } from 'lucide-react';
import * as authApi from '../api/auth';
import { apiError } from '../api/client';

export const LinkBank = () => {
  const { navigateTo, user, setUser } = useAppContext();
  const [upiId, setUpiId] = useState(user?.upi_id || '');
  const [isLinked, setIsLinked] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const valid = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim());

  const handleSave = async (e) => {
    e.preventDefault();
    if (!valid) { setError('Enter a valid UPI ID like name@bank.'); return; }
    setBusy(true); setError('');
    try {
      const updated = await authApi.updateProfile({ upi_id: upiId.trim() });
      setUser(updated);
      setIsLinked(true);
      setTimeout(() => navigateTo('account-settings'), 1500);
    } catch (err) {
      setError(apiError(err, 'Could not save your UPI ID.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button onClick={() => navigateTo('account-settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', marginRight: '0.5rem' }}>
            <ArrowLeft size={20} color="var(--text-dark)" />
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>Link UPI ID</h1>
        </div>

        {isLinked ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>UPI ID Saved!</h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Owners can now send your rewards directly to this UPI ID.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
              <Lock size={24} color="#15803D" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                Your UPI ID is only shared with an owner who owes you a reward, so they can pay you directly. We never see or hold the money.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smartphone size={16} /> Your UPI ID
              </label>
              <input type="text" className="form-input" value={upiId}
                onChange={(e) => { setUpiId(e.target.value.trim()); setError(''); }}
                placeholder="yourname@okhdfcbank" autoCapitalize="none" autoCorrect="off" />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: 6 }}>
                Find it in your GPay / PhonePe / Paytm app (e.g. <b>name@okhdfcbank</b>, <b>number@ybl</b>).
              </p>
            </div>

            {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}

            <button type="submit" className="btn-save-changes" disabled={busy || !valid} style={{ opacity: busy || !valid ? 0.6 : 1 }}>
              {busy ? 'Saving…' : 'Save UPI ID'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
