import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, CheckCircle, IndianRupee, ShieldCheck } from 'lucide-react';

export const RewardPayment = () => {
  const { navigateTo, confirmRewardPayment } = useAppContext();
  const [selectedUpi, setSelectedUpi] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      confirmRewardPayment();
    }, 1500);
  };

  return (
    <div className="dashboard-wrapper" style={{ paddingBottom: '6rem' }}>
      <div className="dashboard-container">
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', cursor: 'pointer', color: 'var(--text-gray)' }} onClick={() => navigateTo('rewards')}>
          <ArrowLeft size={20} style={{ marginRight: '8px' }} /> Back to Escrow
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
           <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Reward Payment</h1>
           <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Securely pay the reward to the finder via Escrow.</p>
        </div>

        <div className="white-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Item</span>
             <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Black Leather Wallet</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-light)' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600' }}>Finder</span>
             <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Sarah M.</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ color: 'var(--text-gray)', fontWeight: '600', fontSize: '1.1rem' }}>Total Reward Amount</span>
             <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={20} /> 500
             </span>
           </div>
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '1rem' }}>Select UPI Option</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
           <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: `2px solid ${selectedUpi === 'gpay' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedUpi === 'gpay' ? 'var(--primary-light)' : 'white' }}>
             <input type="radio" name="upi" value="gpay" checked={selectedUpi === 'gpay'} onChange={() => setSelectedUpi('gpay')} />
             <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Google Pay</div>
           </label>
           <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: `2px solid ${selectedUpi === 'phonepe' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedUpi === 'phonepe' ? 'var(--primary-light)' : 'white' }}>
             <input type="radio" name="upi" value="phonepe" checked={selectedUpi === 'phonepe'} onChange={() => setSelectedUpi('phonepe')} />
             <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>PhonePe</div>
           </label>
           <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: `2px solid ${selectedUpi === 'paytm' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedUpi === 'paytm' ? 'var(--primary-light)' : 'white' }}>
             <input type="radio" name="upi" value="paytm" checked={selectedUpi === 'paytm'} onChange={() => setSelectedUpi('paytm')} />
             <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Paytm</div>
           </label>
           <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: `2px solid ${selectedUpi === 'other' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedUpi === 'other' ? 'var(--primary-light)' : 'white' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <input type="radio" name="upi" value="other" checked={selectedUpi === 'other'} onChange={() => setSelectedUpi('other')} />
               <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Other UPI ID</div>
             </div>
             {selectedUpi === 'other' && (
               <input type="text" placeholder="Enter UPI ID (e.g., name@bank)" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="form-input" style={{ marginTop: '0.5rem' }} />
             )}
           </label>
        </div>

        <div style={{ backgroundColor: '#EEF2FF', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#4F46E5', fontSize: '0.85rem' }}>
           <ShieldCheck size={20} style={{ flexShrink: 0 }} />
           <span>Your payment is secured by Escrow. It will only be released to the finder once you confirm.</span>
        </div>

        <button className="btn-submit" onClick={handleConfirmPayment} disabled={isProcessing || (selectedUpi === 'other' && !upiId.trim())} style={{ opacity: (isProcessing || (selectedUpi === 'other' && !upiId.trim())) ? 0.7 : 1 }}>
          {isProcessing ? 'Processing Payment...' : 'Confirm Payment'}
        </button>

      </div>
    </div>
  );
};
