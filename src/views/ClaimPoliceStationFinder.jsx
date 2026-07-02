import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Building2, MapPin, Phone, CheckCircle, ArrowLeft } from 'lucide-react';

export const ClaimPoliceStationFinder = () => {
  const { policeStationDetails, navigateTo } = useAppContext();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    // Navigate to success page
    navigateTo('claim-success');
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container slide-up">
        
        {/* --- DEMO CONTROLS (For UI testing only) --- */}
        <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: '#B45309', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>UI Demo Controls</h4>
            <p style={{ fontSize: '0.8rem', color: '#B45309', margin: 0 }}>Jump to the Owner's perspective.</p>
          </div>
          <button className="btn-secondary" style={{ backgroundColor: 'white', borderColor: '#F59E0B', color: '#B45309', padding: '0.5rem 1rem' }} onClick={() => navigateTo('claim-police-station-owner')}>
            View as Owner
          </button>
        </div>

        <div className="match-header-bar" onClick={() => navigateTo('claim-handover-method')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: 'var(--text-gray)', fontWeight: '600' }}>
          <ArrowLeft size={18}/> Back
        </div>

        <div className="dashboard-header">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Police Station Handover
          </h1>
          <p>Drop the item at your nearest police station. Once confirmed, the owner will receive the station details.</p>
        </div>

        <div className="glass-card fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} color="var(--primary)" /> {policeStationDetails.name}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
              <MapPin size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{policeStationDetails.address}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
              <Phone size={18} />
              <span>{policeStationDetails.phone}</span>
            </div>

            <div className="map-container" style={{ height: '200px', marginTop: '1rem', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80&fit=crop" alt="Map Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginTop: '-0.5rem' }}>
              📍 1.2 miles away (Est. 5 mins drive)
            </div>

            {!showConfirm ? (
              <button className="btn-primary" style={{ marginTop: '1.5rem', padding: '1rem' }} onClick={() => setShowConfirm(true)}>
                Confirm Handed Over
              </button>
            ) : (
              <div className="fade-in" style={{ marginTop: '1.5rem', backgroundColor: 'var(--bg-alt)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-dark)' }}>Are you sure the item has been handed over?</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={handleConfirm}>
                    Yes
                  </button>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>
                    No
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};
