import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAppContext } from '../context/AppContext';
import { Gift, IndianRupee, CheckCircle, Smartphone } from 'lucide-react';
import * as rewardsApi from '../api/rewards';
import { apiError } from '../api/client';

const buildUpiLink = (vpa, amount, name, item) =>
  `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name || 'Finder')}&am=${amount}&cu=INR&tn=${encodeURIComponent('Reward for ' + (item || 'item'))}`;

export const Rewards = () => {
  const { navigateTo, currentClaim } = useAppContext();
  const claimId = currentClaim?.id;

  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);

  const load = async () => {
    if (!claimId) { setLoading(false); return; }
    try {
      const r = await rewardsApi.getReward(claimId);
      setReward(r);
      if (r.amount && Number(r.amount) > 0) setAmount(String(Math.round(Number(r.amount))));
    } catch (err) {
      setError(apiError(err, 'Could not load reward.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [claimId]);

  // Build a UPI QR for the current amount so the owner can pay from a laptop by
  // scanning it with their phone (upi:// links only open on mobile).
  useEffect(() => {
    const vpa = reward?.finder_upi_id || '';
    const n = Number(amount);
    if (!vpa || !(n >= 1 && n <= 100000)) { setQr(''); return; }
    const link = buildUpiLink(vpa, n, reward?.finder_name, reward?.item_title);
    QRCode.toDataURL(link, { width: 220, margin: 1 }).then(setQr).catch(() => setQr(''));
  }, [reward, amount]);

  const isOwner = reward?.role === 'owner';
  const released = reward?.escrow_status === 'RELEASED';
  const awaiting = reward?.escrow_status === 'AWAITING';
  const finderUpi = reward?.finder_upi_id || '';
  const validAmount = () => { const n = Number(amount); return n >= 1 && n <= 100000; };

  // Owner: one action — open the UPI payment AND send the finder the OTP.
  const handleSend = async () => {
    if (!validAmount() || !finderUpi) return;
    setBusy(true); setError('');
    try {
      await rewardsApi.setRewardAmount(claimId, Number(amount));
      await rewardsApi.initiateReward(claimId);
      const link = buildUpiLink(finderUpi, Number(amount), reward.finder_name, reward.item_title);
      window.location.href = link;   // opens the UPI app on mobile; no-op on laptop (use the QR)
      await load();
    } catch (err) {
      setError(apiError(err, 'Could not send the reward.'));
    } finally {
      setBusy(false);
    }
  };

  // Fallback for when a UPI app blocks the tap-to-pay link: copy the finder's UPI
  // ID so the owner can paste it into their UPI app manually.
  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(finderUpi);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable */ }
  };

  // Owner: re-issue the confirmation code (amount already set).
  const handleResend = async () => {
    setBusy(true); setError('');
    try {
      await rewardsApi.initiateReward(claimId);
      await load();
    } catch (err) {
      setError(apiError(err, 'Could not resend the code.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="dashboard-wrapper"><div className="dashboard-container" style={{ textAlign: 'center', padding: '3rem' }}>Loading reward…</div></div>;

  if (!reward) {
    return (
      <div className="dashboard-wrapper"><div className="dashboard-container" style={{ textAlign: 'center', padding: '3rem' }}>
        {error || 'No reward available for this claim.'}
        <div style={{ marginTop: '1.5rem' }}><button className="btn-primary" onClick={() => navigateTo('dashboard')}>Back to Dashboard</button></div>
      </div></div>
    );
  }

  const upiLink = finderUpi && validAmount() ? buildUpiLink(finderUpi, Number(amount), reward.finder_name, reward.item_title) : null;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <Gift size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Reward</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
            {isOwner ? 'Pay the finder directly via UPI, then they confirm receipt with a code.' : 'The owner will send your reward via UPI.'}
          </p>
        </div>

        <div className="white-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <Row label="Item" value={reward.item_title} />
          <Row label="Finder" value={reward.finder_name} />
          {isOwner && <Row label="Finder UPI ID" value={finderUpi || 'Not added yet'} />}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ color: 'var(--text-gray)', fontWeight: '600', fontSize: '1.1rem' }}>Reward Amount</span>
            {isOwner && !released && !awaiting ? (
              <div style={{ position: 'relative', width: '100%', maxWidth: '200px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)', fontWeight: '600' }}>₹</span>
                <input type="text" value={amount}
                  onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setAmount(v); }}
                  placeholder="Amount"
                  style={{ width: '100%', padding: '12px 12px 12px 28px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', outline: 'none' }} />
              </div>
            ) : (
              <span style={{ fontWeight: '800', color: released ? '#10B981' : 'var(--primary)', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={20} /> {Number(reward.amount || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {isOwner && !released && !awaiting && amount && !validAmount() && (
            <div style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '6px', textAlign: 'right' }}>Enter ₹1 – ₹1,00,000</div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <Row label="Status" value={
            <span style={{ color: released ? '#10B981' : 'var(--text-gray)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {released && <CheckCircle size={16} />} {released ? 'Released' : awaiting ? 'Awaiting finder confirmation' : 'Not sent yet'}
            </span>
          } />
        </div>

        {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}

        {released ? (
          <button className="btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => navigateTo('dashboard')}>Done — Back to Dashboard</button>
        ) : !isOwner ? (
          <button className="btn-submit" disabled style={{ opacity: 0.6 }}>Awaiting reward from owner</button>
        ) : !finderUpi ? (
          <div style={{ padding: '1rem', background: '#FEF3C7', color: '#92400E', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600 }}>
            The finder hasn't added their UPI ID yet, so you can't pay them. Ask them to add it under Account → Link UPI.
          </div>
        ) : awaiting ? (
          <div>
            <div style={{ padding: '1rem', background: 'var(--primary-light)', color: 'var(--primary-hover)', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
              A confirmation code was sent to {reward.finder_name}. They’ll enter it once they receive the ₹{Number(reward.amount).toLocaleString('en-IN')} — then the reward is complete.
            </div>
            {qr && (
              <div style={{ textAlign: 'center', margin: '0 0 1rem', padding: '1rem', border: '1px dashed var(--border-light)', borderRadius: 12 }}>
                <img src={qr} alt="UPI payment QR" style={{ width: 180, height: 180 }} />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-gray)', margin: '0.5rem 0 0' }}>Not paid yet? <b>Scan to pay</b> ₹{Number(amount || 0).toLocaleString('en-IN')} on your phone.</p>
              </div>
            )}
            {upiLink && (
              <a className="btn-primary" href={upiLink} style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', marginBottom: '0.75rem' }}>
                <Smartphone size={18} /> Pay again via UPI
              </a>
            )}
            <button className="btn-cancel" onClick={handleResend} disabled={busy}>{busy ? 'Sending…' : 'Resend confirmation code'}</button>
          </div>
        ) : (
          <div>
            {qr && (
              <div style={{ textAlign: 'center', margin: '0 0 1rem', padding: '1rem', border: '1px dashed var(--border-light)', borderRadius: 12 }}>
                <img src={qr} alt="UPI payment QR" style={{ width: 180, height: 180 }} />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-gray)', margin: '0.5rem 0 0' }}>
                  On a laptop? <b>Scan this QR</b> with any UPI app to pay ₹{Number(amount || 0).toLocaleString('en-IN')}.
                </p>
              </div>
            )}
            <button className="btn-submit" disabled={!validAmount() || busy} onClick={handleSend}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: validAmount() && !busy ? 1 : 0.5 }}>
              {busy ? 'Processing…' : <><Smartphone size={18} /> Pay ₹{Number(amount || 0).toLocaleString('en-IN')} to {reward.finder_name} via UPI</>}
            </button>
            <button type="button" className="btn-cancel" onClick={copyUpi} style={{ marginTop: '0.5rem' }}>
              {copied ? '✓ UPI ID copied — paste it in your UPI app' : 'UPI app blocked the link? Copy UPI ID'}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '0.75rem', textAlign: 'center' }}>
              Pay from your UPI app (or scan the QR). This also sends {reward.finder_name} a code to confirm they received it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
    <span style={{ color: 'var(--text-gray)', fontWeight: '600', flexShrink: 0 }}>{label}</span>
    <span style={{ fontWeight: '700', color: 'var(--text-dark)', textAlign: 'right', wordBreak: 'break-word', minWidth: 0 }}>{value}</span>
  </div>
);
