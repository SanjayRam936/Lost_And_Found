import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { KeyRound, Copy, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ChatBox } from '../components/ChatBox';
import * as claimsApi from '../api/claims';

export const ClaimOtpOwner = () => {
  const { currentClaim, currentMatch, handleRegenerateOtp, navigateTo } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [resolved, setResolved] = useState(false);

  const otp = currentClaim?.otp_code || '------';

  // Poll the claim: the moment the finder enters the correct OTP, both sides
  // see "Handover Successful". The owner is then routed to the reward page
  // (only if the finder opted in for a reward) or the success screen.
  useEffect(() => {
    if (!currentClaim?.id) return;
    const id = setInterval(async () => {
      try {
        const c = await claimsApi.getClaim(currentClaim.id);
        if (c.status === 'RESOLVED') {
          clearInterval(id);
          setResolved(true);
          setTimeout(() => {
            navigateTo(c.wants_reward ? 'rewards' : 'claim-success');
          }, 1800);
        }
      } catch {
        // ignore transient polling errors
      }
    }, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClaim?.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (resolved) {
    return (
      <div className="dashboard-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="dashboard-container">
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div className="success-circle"><ShieldCheck size={48} color="var(--primary)" /></div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Handover Successful</h2>
            <p style={{ color: 'var(--text-gray)' }}>
              {currentClaim?.wants_reward ? 'Taking you to the reward page…' : 'Your item has been returned.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container slide-up">

        <div className="match-header-bar" onClick={() => navigateTo('match-detail', null, { lostPk: currentMatch?.lost_item })} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: 'var(--text-gray)', fontWeight: '600' }}>
          <ArrowLeft size={18}/> Back
        </div>

        <div className="dashboard-header">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound color="var(--primary)" /> Handover OTP
          </h1>
          <p>Use the chat below to arrange the meetup. When you receive your item in person, read this OTP aloud so the finder can confirm the handover.</p>
        </div>

        <div className="glass-card fade-in" style={{ textAlign: 'center' }}>
          <div className="claim-otp-display">{otp.split('').join(' ')}</div>
          <div style={{ marginBottom: '1.25rem', fontWeight: '600', color: 'var(--text-gray)', fontSize: '0.85rem' }}>
            This code stays valid until the handover is complete.
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={handleCopy} style={{ flex: 1 }}>
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />} {copied ? 'Copied!' : 'Copy OTP'}
            </button>
            <button className="btn-secondary" onClick={handleRegenerateOtp} style={{ flex: 1 }}>
              <RefreshCw size={18} /> Regenerate
            </button>
          </div>
        </div>

        {/* Embedded per-match chat */}
        <div style={{ marginTop: '1.5rem' }}>
          <ChatBox matchId={currentMatch?.id} heading="Chat with Finder" />
        </div>

        <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertCircle color="#F59E0B" size={22} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
            Only read the OTP to the finder in person, at the moment of handover. The handover is confirmed once they enter it.
          </span>
        </div>

      </div>
    </div>
  );
};
