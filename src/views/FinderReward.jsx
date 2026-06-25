import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { IndianRupee, ShieldCheck, CheckCircle } from 'lucide-react';

export const FinderReward = () => {
  const { navigateTo, escrowTimeline } = useAppContext();
  const isReleased = escrowTimeline.rewardReleased;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
           <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Reward Claim</h1>
           <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>The owner has released the reward for finding their item.</p>
        </div>

        <div className="white-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderTop: '4px solid #10B981' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Item</span>
             <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Black Leather Wallet</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Owner</span>
             <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>John D.</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Status</span>
             <span style={{ fontWeight: '700', color: isReleased ? '#10B981' : 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
               {isReleased && <CheckCircle size={16} />} {isReleased ? 'Released' : 'Pending Payment'}
             </span>
           </div>
           {isReleased && (
             <>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
                 <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Transaction ID</span>
                 <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>TXN-849201A</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
                 <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Payment Date</span>
                 <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{new Date().toLocaleDateString()}</span>
               </div>
             </>
           )}
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600', fontSize: '1.1rem' }}>Total Reward</span>
             <span style={{ fontWeight: '800', color: '#10B981', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={20} /> 500
             </span>
           </div>
        </div>

        <button 
          className="btn-submit" 
          disabled={true} 
          style={{ backgroundColor: isReleased ? '#10B981' : 'var(--text-gray)', opacity: isReleased ? 0.7 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'not-allowed' }}>
          {isReleased ? 'Reward Received' : 'Awaiting Reward Release'}
        </button>

      </div>
    </div>
  );
};
