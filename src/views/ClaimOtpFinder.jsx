import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, ArrowRight, XCircle } from 'lucide-react';

export const ClaimOtpFinder = () => {
  const { generatedOtp, navigateTo } = useAppContext();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(false);

    if (value !== '' && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp === generatedOtp) {
      setSuccess(true);
      setTimeout(() => {
        navigateTo('claim-handover-method');
      }, 1500);
    } else {
      setError(true);
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Ownership Verified Successfully</h2>
            <p style={{ color: 'var(--text-gray)' }}>Redirecting to handover options...</p>
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
            Enter Verification Code
          </h1>
          <p>Please ask the owner to read their 6-digit verification code to confirm ownership.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card fade-in">
          <div className="claim-otp-input-container">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                className="claim-otp-input"
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                maxLength={1}
                autoComplete="off"
              />
            ))}
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--error)', marginBottom: '1.5rem', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '8px' }} className="fade-in">
              <XCircle size={20} />
              <span style={{ fontWeight: '600' }}>Invalid OTP. Please ask the owner to read the code again.</span>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
            Verify Ownership <ArrowRight size={20} />
          </button>
        </form>

      </div>
    </div>
  );
};
