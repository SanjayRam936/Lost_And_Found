import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Building2, MapPin, ArrowRight } from 'lucide-react';

export const ClaimHandoverMethod = () => {
  const { navigateTo, setHandoverMethod } = useAppContext();

  const handleSelectMethod = (method) => {
    setHandoverMethod(method);
    if (method === 'police') {
      navigateTo('claim-police-station-finder');
    } else {
      navigateTo('claim-custom-location-finder');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container slide-up">
        
        <div className="dashboard-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Choose Handover Method</h1>
          <p>Select how you would like to return the item.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card hover-lift fade-in" onClick={() => handleSelectMethod('police')} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '12px' }}>
                <Building2 size={28} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-dark)', margin: 0 }}>
                Hand Over at Police Station
              </h2>
            </div>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
              Leave the item at the nearest police station. The owner will receive the station details to collect it securely.
            </p>
            <div style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              <button className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={(e) => { e.stopPropagation(); handleSelectMethod('police'); }}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="glass-card hover-lift fade-in" onClick={() => handleSelectMethod('custom')} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: 'var(--purple-light)', padding: '12px', borderRadius: '12px' }}>
                <MapPin size={28} color="var(--purple)" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-dark)', margin: 0 }}>
                Meet at Custom Location
              </h2>
            </div>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
              Choose a safe meeting location (like a cafe or campus desk) for the owner to meet you in person.
            </p>
            <div style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              <button className="btn-primary" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--purple)', borderColor: 'var(--purple)' }} onClick={(e) => { e.stopPropagation(); handleSelectMethod('custom'); }}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
