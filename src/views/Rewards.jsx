import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Gift, IndianRupee, ShieldCheck, CheckCircle } from 'lucide-react';

export const Rewards = () => {
  const { navigateTo, escrowTimeline, setEscrowTimeline } = useAppContext();
  
  const [rewardAmount, setRewardAmount] = useState('');
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Validate the reward amount
  const isValidAmount = () => {
    const amount = Number(rewardAmount);
    return !isNaN(amount) && amount >= 1 && amount <= 100000;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow empty or digits only
    if (value === '' || /^\d+$/.test(value)) {
      setRewardAmount(value);
    }
  };

  const handlePayment = () => {
    if (!isValidAmount()) return;
    
    // Simulate payment flow
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setIsPaymentSuccess(true);
      setPaymentDetails({
        amount: rewardAmount,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        txId: 'TXN' + Math.floor(100000000 + Math.random() * 900000000)
      });
      // Update global context timeline if needed
      setEscrowTimeline(prev => ({ ...prev, rewardReleased: true }));
    }, 1500);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        {showToast && (
          <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10B981', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            Reward sent successfully!
          </div>
        )}

        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
           <Gift size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
           <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Reward & Escrow</h1>
           <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Pay the promised reward securely. It will be held in escrow and released to the finder.</p>
        </div>

        <div className="white-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Item</span>
             <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Black Leather Wallet</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Finder</span>
             <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Sarah M.</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600', fontSize: '1.1rem' }}>Reward Amount</span>
             {!isPaymentSuccess ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%', maxWidth: '200px' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)', fontWeight: '600' }}>₹</span>
                    <input 
                      type="text" 
                      value={rewardAmount}
                      onChange={handleAmountChange}
                      placeholder="Enter reward amount"
                      style={{ 
                        width: '100%', 
                        padding: '12px 12px 12px 28px', 
                        border: '1px solid var(--border-light)', 
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                    />
                  </div>
                  {rewardAmount && !isValidAmount() && (
                    <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '4px' }}>Please enter a valid amount (₹1 - ₹1,00,000)</span>
                  )}
                </div>
             ) : (
                <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                  <IndianRupee size={20} /> {Number(paymentDetails.amount).toLocaleString('en-IN')}
                </span>
             )}
           </div>
        </div>

        {isPaymentSuccess && paymentDetails && (
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #10B981', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: '#10B981' }}>
                <CheckCircle size={24} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Reward Payment Details</h3>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '4px' }}>Amount Paid</div>
                   <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)' }}>₹{Number(paymentDetails.amount).toLocaleString('en-IN')}</div>
                </div>
                <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '4px' }}>Payment Status</div>
                   <div style={{ display: 'inline-flex', padding: '4px 10px', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>Completed</div>
                </div>
                <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '4px' }}>Paid On</div>
                   <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-dark)' }}>{paymentDetails.date}<br/>{paymentDetails.time}</div>
                </div>
                <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '4px' }}>Transaction ID</div>
                   <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-dark)' }}>{paymentDetails.txId}</div>
                </div>
             </div>
          </div>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Escrow Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                 <div style={{ color: '#10B981' }}>
                    <CheckCircle size={24} />
                 </div>
                 <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-dark)' }}>Handover Confirmed</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Completed</div>
                 </div>
              </div>
              
              <div style={{ 
                width: '3px', 
                height: '30px', 
                backgroundColor: isPaymentSuccess ? '#10B981' : 'var(--border-light)', 
                marginLeft: '10px', 
                marginTop: '-10px', 
                marginBottom: '-10px',
                transition: 'background-color 0.5s ease'
              }}></div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', transition: 'all 0.3s ease' }}>
                 <div style={{ 
                    color: isPaymentSuccess ? '#10B981' : 'var(--border-light)',
                    animation: isPaymentSuccess ? 'pulse-glow 1s' : 'none'
                 }}>
                    {isPaymentSuccess ? <CheckCircle size={24} /> : <Gift size={24} />}
                 </div>
                 <div style={{ opacity: isPaymentSuccess ? 1 : 0.6, transition: 'opacity 0.3s ease' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-dark)' }}>Reward Released</div>
                    {isPaymentSuccess ? (
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#10B981', fontWeight: '600', marginTop: '2px' }}>₹{Number(paymentDetails?.amount).toLocaleString('en-IN')} Successfully Sent</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '2px' }}>Completed</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Awaiting payment</div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {!isPaymentSuccess ? (
          <button 
            className="btn-submit" 
            onClick={handlePayment} 
            disabled={!isValidAmount()}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              opacity: isValidAmount() ? 1 : 0.5,
              cursor: isValidAmount() ? 'pointer' : 'not-allowed'
            }}
          >
            Send Reward via UPI
          </button>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-return-dashboard" onClick={() => navigateTo('dashboard')}>Return to Dashboard</button>
          </div>
        )}

      </div>
    </div>
  );
};
