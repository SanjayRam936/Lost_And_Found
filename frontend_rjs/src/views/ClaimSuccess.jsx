import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, Building2, MapPin } from 'lucide-react';
import { MapView } from '../components/MapView';

const HANDOVER_LABEL = {
  POLICE: 'Police Station',
  INSTITUTION: 'Institution / Admin Desk',
};

export const ClaimSuccess = () => {
  const { currentMatch, currentClaim, navigateTo } = useAppContext();

  const found = currentMatch?.found_item;
  const itemName = found?.title || currentMatch?.lost_item_title || 'Your item';
  const isDirect = !currentClaim || currentClaim.handover_type === 'DIRECT';
  const kind = HANDOVER_LABEL[currentClaim?.handover_type] || 'the handover location';

  const place = found?.handover_place || '';
  const lat = found?.handover_latitude ?? null;
  const lng = found?.handover_longitude ?? null;

  return (
    <div className="dashboard-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="dashboard-container slide-up" style={{ width: '100%' }}>
        <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>

          <div className="success-circle">
            {isDirect ? <ShieldCheck size={56} color="var(--primary)" /> : <Building2 size={56} color="var(--primary)" />}
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>
            {isDirect ? 'Item Successfully Returned' : 'Ready for Collection'}
          </h1>
          <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>
            {isDirect
              ? 'The handover was confirmed with the OTP. This claim is now resolved.'
              : `This item was handed over to ${kind}. Please contact/visit them to collect it.`}
          </p>

          <div style={{ backgroundColor: 'var(--bg-alt)', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: isDirect ? 0 : '1rem' }}>
              <span style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Item</span>
              <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{itemName}</span>
            </div>

            {!isDirect && (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '0.75rem', color: 'var(--text-dark)' }}>
                  <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: '600' }}>
                    {place || kind}
                    {place && <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-gray)', fontWeight: 400 }}>{kind}</span>}
                  </span>
                </div>
                <MapView lat={lat} lng={lng} place={place || kind} />
                {(lat == null || lng == null) && !place && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: 8 }}>
                    The finder did not pin an exact location — please contact {kind.toLowerCase()} directly.
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn-primary" style={{ padding: '1rem', width: '100%' }} onClick={() => navigateTo('dashboard')}>
              Back to Dashboard
            </button>
            <button className="btn-secondary" style={{ padding: '1rem', width: '100%' }} onClick={() => navigateTo('my-reports')}>
              View My Reports
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
