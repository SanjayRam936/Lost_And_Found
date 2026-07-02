import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Navigation, Copy, MessageCircle, Clock, CheckCircle } from 'lucide-react';

export const ClaimCustomLocationOwner = () => {
  const { customLocation } = useAppContext();

  const handleCopy = () => {
    navigator.clipboard.writeText(customLocation);
    alert('Address copied to clipboard!');
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container slide-up">
        
        <div className="dashboard-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Meeting Location Received</h1>
          <p>The finder has selected a meeting location.</p>
        </div>

        <div className="glass-card fade-in" style={{ marginBottom: '2rem' }}>
          
          <div className="map-container" style={{ height: '200px', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative' }}>
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80&fit=crop" alt="Meeting Location Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <MapPin size={36} color="var(--primary)" fill="white" />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-dark)', marginBottom: '1rem' }}>
            <MapPin size={24} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--text-gray)' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: '600', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
              {customLocation || 'Coffee Day, Anna Nagar, Chennai'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
              <Navigation size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>2.5 km away</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
              <Clock size={18} color="#F59E0B" />
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>ETA: 12 mins</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn-primary" style={{ padding: '0.875rem', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => window.open('https://maps.google.com', '_blank')}>
              <Navigation size={18} /> Navigate to Location
            </button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={handleCopy}>
                <Copy size={18} /> Copy Address
              </button>
              <button className="btn-secondary" style={{ flex: 1, padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <MessageCircle size={18} /> Contact Finder
              </button>
            </div>
          </div>

        </div>

        <div className="glass-card slide-up" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Handover Progress</h3>
          <div className="timeline-container" style={{ margin: '0' }}>
            
            <div className="timeline-item completed">
              <div className="timeline-icon">
                <CheckCircle size={18} />
              </div>
              <div className="timeline-text">Ownership Verified</div>
            </div>

            <div className="timeline-item completed">
              <div className="timeline-icon">
                <CheckCircle size={18} />
              </div>
              <div className="timeline-text">Meeting Location Shared</div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon">
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--border-light)' }}></div>
              </div>
              <div className="timeline-text">Meet Finder</div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon">
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--border-light)' }}></div>
              </div>
              <div className="timeline-text">Item Received</div>
            </div>

          </div>
          
          <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => navigateTo('claim-success')}>
            Confirm Item Collected
          </button>
        </div>

      </div>
    </div>
  );
};
