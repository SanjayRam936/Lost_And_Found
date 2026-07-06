import React, { useState, useEffect } from 'react';
import { MailCheck, ArrowRight, XCircle, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Email OTP verification — shown right after registration (or when an unverified
// user tries to log in). Confirming the 6-digit code activates the account.
export const VerifyEmail = () => {
  const { pendingEmail, handleVerifyEmail, handleResendEmailOtp, authLoading, navigateTo } = useAppContext();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const change = (i, v) => {
    if (v.length > 1) return;
    if (v && !/^\d$/.test(v)) return;
    const next = [...otp]; next[i] = v; setOtp(next); setError('');
    if (v && i < 5) document.getElementById(`ev-${i + 1}`)?.focus();
  };
  const keyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`ev-${i - 1}`)?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits.'); return; }
    const res = await handleVerifyEmail(code);
    if (!res.ok) setError(res.error || 'Invalid code. Please try again.');
    // On success the context logs the user in and redirects to the dashboard.
  };

  const resend = async () => {
    if (resendIn > 0) return;
    setInfo(''); setError('');
    const res = await handleResendEmailOtp();
    if (res.ok) { setInfo('A new code has been sent to your email.'); setResendIn(30); setOtp(['', '', '', '', '', '']); }
    else setError(res.error || 'Could not resend the code.');
  };

  if (!pendingEmail) {
    return (
      <div className="login-wrapper">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--text-gray)' }}>Start by creating your account.</p>
          <button className="btn-submit" onClick={() => navigateTo('register')}>Go to Register</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="admin-icon-container"><MailCheck size={28} /></div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>Verify your email</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            We sent a 6-digit code to <b style={{ color: 'var(--text-dark)' }}>{pendingEmail}</b>. Enter it below to activate your account.
          </p>
        </div>

        <form onSubmit={submit}>
          <div className="claim-otp-input-container">
            {otp.map((d, i) => (
              <input key={i} id={`ev-${i}`} className="claim-otp-input" type="text" inputMode="numeric"
                value={d} maxLength={1} placeholder="•" autoComplete="off"
                onChange={(e) => change(i, e.target.value)} onKeyDown={(e) => keyDown(i, e)} />
            ))}
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--error)', background: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: '1rem' }}>
              <XCircle size={18} /><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}
          {info && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#047857', background: 'var(--primary-light)', padding: 12, borderRadius: 8, marginBottom: '1rem' }}>
              <ShieldCheck size={18} /><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{info}</span>
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={authLoading} style={{ width: '100%' }}>
            {authLoading ? 'Verifying…' : <>Verify &amp; Continue <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
          Didn&apos;t get it?{' '}
          <span className="register-link" style={{ cursor: resendIn > 0 ? 'default' : 'pointer', opacity: resendIn > 0 ? 0.6 : 1 }} onClick={resend}>
            {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
          </span>
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          <span className="register-link" style={{ fontSize: '0.8rem' }} onClick={() => navigateTo('register')}>← Back to register</span>
        </div>
      </div>
    </div>
  );
};
