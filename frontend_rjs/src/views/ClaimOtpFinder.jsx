import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, ArrowRight, XCircle } from 'lucide-react';
import { ChatBox } from '../components/ChatBox';

export const ClaimOtpFinder = () => {
  const { currentMatch, handleVerifyOtp, navigateTo } = useAppContext();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value !== '' && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setSubmitting(true);
    const res = await handleVerifyOtp(enteredOtp);
    setSubmitting(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        // Reward opt-in routes the finder to the reward status page; otherwise success.
        navigateTo(res.wantsReward ? 'finder-reward' : 'claim-success');
      }, 1500);
    } else {
      setError(res.error || 'Invalid OTP. Please ask the owner to read the code again.');
    }
  };

  if (success) {
    return (
      <div className="dashboard-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="dashboard-container">
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div className="success-circle">
              <ShieldCheck size={48} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Handover Confirmed</h2>
            <p style={{ color: 'var(--text-gray)' }}>Finishing up…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container slide-up">

        <div className="dashboard-header">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Enter Handover OTP
          </h1>
          <p>Once you have handed the item to its owner in person, ask them to read out their 6-digit OTP and enter it here to confirm the handover.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card fade-in">
          <div className="claim-otp-input-container">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                className="claim-otp-input"
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                maxLength={1}
                placeholder="•"
                autoComplete="off"
              />
            ))}
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--error)', marginBottom: '1.5rem', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '8px' }} className="fade-in">
              <XCircle size={20} />
              <span style={{ fontWeight: '600' }}>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
            {submitting ? 'Confirming…' : <>Confirm Handover <ArrowRight size={20} /></>}
          </button>
        </form>

        {/* Embedded per-match chat */}
        <div style={{ marginTop: '1.5rem' }}>
          <ChatBox matchId={currentMatch?.id} heading="Chat with Owner" />
        </div>

      </div>
    </div>
  );
};
