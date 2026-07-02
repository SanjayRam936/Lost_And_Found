import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Building, CreditCard, Lock, CheckCircle, User } from 'lucide-react';

export const LinkBank = () => {
  const { navigateTo } = useAppContext();
  const [bankDetails, setBankDetails] = useState({ accountName: '', accountNumber: '', ifscCode: '', upiId: '' });
  const [isLinked, setIsLinked] = useState(false);

  const handleLinkBank = (e) => {
    e.preventDefault();
    setIsLinked(true);
    setTimeout(() => navigateTo('account-settings'), 2000);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button onClick={() => navigateTo('account-settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', marginRight: '0.5rem' }}>
            <ArrowLeft size={20} color="var(--text-dark)" />
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>Link Bank Account</h1>
        </div>

        {isLinked ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Bank Account Linked!</h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>You can now seamlessly send and receive rewards via escrow.</p>
          </div>
        ) : (
          <form onSubmit={handleLinkBank} style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
              <Lock size={24} color="#15803D" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                Your bank details are 256-bit encrypted and securely stored. Used exclusively for Escrow Reward processing.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} /> Account Holder Name
              </label>
              <input type="text" className="form-input" required value={bankDetails.accountName} onChange={e => setBankDetails({...bankDetails, accountName: e.target.value})} placeholder="As per bank records" />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={16} /> Account Number
              </label>
              <input type="password" className="form-input" required value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} placeholder="Enter account number" />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={16} /> IFSC Code
              </label>
              <input type="text" className="form-input" required value={bankDetails.ifscCode} onChange={e => setBankDetails({...bankDetails, ifscCode: e.target.value})} placeholder="e.g. HDFC0001234" style={{ textTransform: 'uppercase' }} />
            </div>

            <div className="divider" style={{ margin: '1.5rem 0' }}>OR</div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">UPI ID (Fastest)</label>
              <input type="text" className="form-input" value={bankDetails.upiId} onChange={e => setBankDetails({...bankDetails, upiId: e.target.value})} placeholder="yourname@upi" />
            </div>

            <button type="submit" className="btn-save-changes">
              Securely Link Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
