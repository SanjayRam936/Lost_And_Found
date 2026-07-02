import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Building2, MapPin, Phone, Clock, Navigation } from 'lucide-react';

export const ClaimPoliceStationOwner = () => {
  const { policeStationDetails } = useAppContext();

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container slide-up">
        
        <div className="dashboard-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Your Item is Ready for Collection</h1>
          <p>The finder has safely handed over your item.</p>
        </div>

        <div className="glass-card fade-in">
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-gray)', margin: '0 0 1rem 0' }}>
            Collect it from:
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={24} color="var(--primary)" /> {policeStationDetails.name}
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-dark)' }}>
              <MapPin size={20} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--text-gray)' }} />
              <span style={{ lineHeight: '1.5' }}>{policeStationDetails.address}</span>
            </div>

            <div className="map-container" style={{ height: '150px', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80&fit=crop" alt="Map Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-dark)' }}>
              <Clock size={20} color="var(--text-gray)" />
              <span>Working Hours: <strong>{policeStationDetails.hours}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-dark)' }}>
              <Phone size={20} color="var(--text-gray)" />
              <span>Contact: <strong>{policeStationDetails.phone}</strong></span>
            </div>

            <button className="btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => window.open('https://maps.google.com', '_blank')}>
              <Navigation size={18} /> Open Navigation
            </button>
            
            <button className="btn-secondary" style={{ padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => navigateTo('claim-success')}>
              Confirm Item Collected
            </button>
            
          </div>
        </div>

      </div>
    </div>
  );
};
