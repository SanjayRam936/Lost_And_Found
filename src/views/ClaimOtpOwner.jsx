import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { KeyRound, Copy, Share2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ClaimOtpOwner = () => {
  const { generatedOtp, navigateTo } = useAppContext();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container slide-up">
        
        {/* --- DEMO CONTROLS (For UI testing only) --- */}
        <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: '#B45309', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>UI Demo Controls</h4>
            <p style={{ fontSize: '0.8rem', color: '#B45309', margin: 0 }}>Jump to the Finder's perspective to test the flow.</p>
          </div>
          <button className="btn-secondary" style={{ backgroundColor: 'white', borderColor: '#F59E0B', color: '#B45309', padding: '0.5rem 1rem' }} onClick={() => navigateTo('claim-otp-finder')}>
            View as Finder
          </button>
        </div>

        <div className="match-header-bar" onClick={() => navigateTo('match-detail')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: 'var(--text-gray)', fontWeight: '600' }}>
          <ArrowLeft size={18}/> Back
        </div>

        <div className="dashboard-header">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound color="var(--primary)" /> Verify Ownership
          </h1>
          <p>To securely verify ownership, a unique 6-digit OTP has been generated. Please read this OTP aloud to the person who found your item.</p>
        </div>

        <div className="glass-card fade-in" style={{ textAlign: 'center' }}>
          <div className="claim-otp-display">
            {generatedOtp.split('').join(' ')}
          </div>
          
          <div style={{ marginBottom: '1.5rem', fontWeight: '600', color: timeLeft <= 60 ? 'var(--error)' : 'var(--text-gray)' }}>
            OTP expires in {formatTime(timeLeft)}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <button className="btn-secondary" onClick={handleCopy} style={{ flex: 1 }}>
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy OTP'}
            </button>
            <button className="btn-secondary" onClick={() => alert('Share dialog opened')} style={{ flex: 1 }}>
              <Share2 size={18} /> Share OTP
            </button>
          </div>
          
          {timeLeft === 0 && (
            <button className="btn-primary" onClick={() => setTimeLeft(300)}>
              Regenerate OTP
            </button>
          )}
        </div>

        <div className="glass-card slide-up" style={{ marginTop: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <CheckCircle2 color="var(--primary)" size={24} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>
              Never share this OTP with anyone except the finder.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <CheckCircle2 color="var(--primary)" size={24} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>
              This code confirms you are the rightful owner.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <AlertCircle color="#F59E0B" size={24} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
              Do NOT allow the next step until the Finder enters the correct OTP.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
