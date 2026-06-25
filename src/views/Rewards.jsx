import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Gift, IndianRupee, ShieldCheck, CheckCircle } from 'lucide-react';

export const Rewards = () => {
  const { navigateTo, escrowTimeline } = useAppContext();

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
           <Gift size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
           <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Reward & Escrow</h1>
           <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Pay the promised reward securely. It will be held in escrow and released to the finder.</p>
        </div>

        <div className="white-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Item</span>
             <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Black Leather Wallet</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Finder</span>
             <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Sarah M.</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600', fontSize: '1.1rem' }}>Total Reward</span>
             <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={20} /> 500
             </span>
           </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '1rem' }}>Escrow Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                 <div style={{ color: escrowTimeline.paymentSecured ? '#10B981' : 'var(--border-light)' }}>
                    {escrowTimeline.paymentSecured ? <CheckCircle size={20} /> : <ShieldCheck size={20} />}
                 </div>
                 <div style={{ opacity: escrowTimeline.paymentSecured ? 1 : 0.5 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Payment Secured</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{escrowTimeline.paymentSecured ? 'Completed' : 'Awaiting your payment.'}</div>
                 </div>
              </div>
              <div style={{ width: '2px', height: '20px', backgroundColor: 'var(--border-light)', marginLeft: '9px', marginTop: '-10px', marginBottom: '-10px' }}></div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                 <div style={{ color: escrowTimeline.handoverConfirmed ? '#10B981' : 'var(--border-light)' }}>
                    {escrowTimeline.handoverConfirmed ? <CheckCircle size={20} /> : <ShieldCheck size={20} />}
                 </div>
                 <div style={{ opacity: escrowTimeline.handoverConfirmed ? 1 : 0.5 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Handover Confirmed</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{escrowTimeline.handoverConfirmed ? 'Completed' : 'You have confirmed receiving the item.'}</div>
                 </div>
              </div>
              <div style={{ width: '2px', height: '20px', backgroundColor: 'var(--border-light)', marginLeft: '9px', marginTop: '-10px', marginBottom: '-10px' }}></div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                 <div style={{ color: escrowTimeline.rewardReleased ? '#10B981' : 'var(--border-light)' }}>
                    {escrowTimeline.rewardReleased ? <CheckCircle size={20} /> : <Gift size={20} />}
                 </div>
                 <div style={{ opacity: escrowTimeline.rewardReleased ? 1 : 0.5 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Reward Released</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{escrowTimeline.rewardReleased ? 'Reward transferred successfully' : 'Awaiting reward payment'}</div>
                 </div>
              </div>
           </div>
        </div>

        {!escrowTimeline.rewardReleased ? (
          <button className="btn-submit" onClick={() => navigateTo('reward-payment', null, { id: 1 })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Pay Reward via UPI
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '12px', fontWeight: '700' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', animation: 'pulse-glow 2s infinite' }}>
              <CheckCircle size={32} />
            </div>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Claim Completed</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '400' }}>Reward Successfully Released</div>
            <button className="btn-return-dashboard" onClick={() => navigateTo('dashboard')} style={{ marginTop: '1.5rem' }}>Return to Dashboard</button>
          </div>
        )}

      </div>
    </div>
  );
};
