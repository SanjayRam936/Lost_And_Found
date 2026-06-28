import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, Calendar, Clock, MapPin, Building2 } from 'lucide-react';

export const ClaimSuccess = () => {
  const { handoverMethod, policeStationDetails, customLocation, navigateTo } = useAppContext();

  return (
    <div className="dashboard-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="dashboard-container slide-up" style={{ width: '100%' }}>
        
        <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          
          <div className="success-circle">
            <ShieldCheck size={56} color="var(--primary)" />
          </div>
          
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>
            Item Successfully Returned
          </h1>
          <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>
            Your item has been safely returned.
          </p>

          <div style={{ backgroundColor: 'var(--bg-alt)', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid var(--border-light)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Item Name</span>
              <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Black Leather Wallet</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-gray)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> Date
              </span>
              <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>Oct 24, 2023</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-gray)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> Time
              </span>
              <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>2:45 PM</span>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-gray)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Handover Method</span>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-dark)' }}>
                {handoverMethod === 'police' ? (
                  <>
                    <Building2 size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: '600', lineHeight: '1.4' }}>{policeStationDetails.name}<br/><span style={{ fontSize: '0.85rem', color: 'var(--text-gray)', fontWeight: 'normal' }}>{policeStationDetails.address}</span></span>
                  </>
                ) : (
                  <>
                    <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: '600', lineHeight: '1.4' }}>Custom Meeting Location<br/><span style={{ fontSize: '0.85rem', color: 'var(--text-gray)', fontWeight: 'normal' }}>{customLocation || 'Coffee Day, Anna Nagar'}</span></span>
                  </>
                )}
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn-primary" style={{ padding: '1rem', width: '100%' }} onClick={() => navigateTo('dashboard')}>
              Back to Dashboard
            </button>
            <button className="btn-secondary" style={{ padding: '1rem', width: '100%' }} onClick={() => navigateTo('report')}>
              Report Another Item
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
