import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Navigation2, Type, ArrowLeft } from 'lucide-react';

export const ClaimCustomLocationFinder = () => {
  const { setCustomLocation, navigateTo } = useAppContext();
  const [showConfirm, setShowConfirm] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(''); // 'live' or 'manual'

  const handleConfirm = () => {
    if (selectedMethod === 'live') {
      setCustomLocation('Current Live Location');
    } else {
      setCustomLocation(manualLocation);
    }
    // Navigate to a waiting screen or owner page for demo purposes
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
          <button className="btn-secondary" style={{ backgroundColor: 'white', borderColor: '#F59E0B', color: '#B45309', padding: '0.5rem 1rem' }} onClick={() => navigateTo('claim-custom-location-owner')}>
            View as Owner
          </button>
        </div>

        <div className="match-header-bar" onClick={() => navigateTo('claim-handover-method')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: 'var(--text-gray)', fontWeight: '600' }}>
          <ArrowLeft size={18}/> Back
        </div>

        <div className="dashboard-header">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Choose Meeting Location
          </h1>
          <p>Select a safe meeting location to hand over the item.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className={`glass-card hover-lift fade-in ${selectedMethod === 'live' ? 'active' : ''}`} onClick={() => setSelectedMethod('live')} style={{ borderColor: selectedMethod === 'live' ? 'var(--primary)' : 'rgba(255,255,255,0.5)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <Navigation2 size={24} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Use Live Location</h3>
            </div>
            
            {selectedMethod === 'live' && (
              <div className="slide-up">
                <div className="map-container" style={{ height: '160px', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', position: 'relative' }}>
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80&fit=crop" alt="Live Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <MapPin size={32} color="var(--error)" fill="white" />
                  </div>
                </div>
                {!showConfirm && (
                  <button className="btn-primary" style={{ width: '100%', padding: '0.875rem' }} onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}>
                    Use My Current Location
                  </button>
                )}
              </div>
            )}
          </div>

          <div className={`glass-card hover-lift fade-in ${selectedMethod === 'manual' ? 'active' : ''}`} onClick={() => setSelectedMethod('manual')} style={{ borderColor: selectedMethod === 'manual' ? 'var(--primary)' : 'rgba(255,255,255,0.5)', padding: '1.5rem', animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <Type size={24} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Type Location Manually</h3>
            </div>
            
            {selectedMethod === 'manual' && (
              <div className="slide-up">
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '100px', marginBottom: '1rem', backgroundColor: 'var(--bg-alt)' }} 
                  placeholder="Example:&#10;Coffee Day,&#10;Anna Nagar,&#10;Chennai"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                />
                {!showConfirm && (
                  <button className="btn-primary" style={{ width: '100%', padding: '0.875rem' }} onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }} disabled={!manualLocation.trim()}>
                    Confirm Meeting Location
                  </button>
                )}
              </div>
            )}
          </div>

          {showConfirm && (
            <div className="glass-card slide-up" style={{ backgroundColor: 'white', borderColor: 'var(--primary)', textAlign: 'center', padding: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-dark)' }}>Share this meeting location with the owner?</h4>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleConfirm}>
                  Yes, Share Location
                </button>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
