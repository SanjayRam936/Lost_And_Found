import React from 'react';
import { ArrowLeft, Building2, Landmark, MapPin, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MapView } from '../components/MapView';

// Owner-facing, re-openable collection screen for a POLICE / INSTITUTION handover.
// Reads the REAL drop-off location off the matched found item, so the owner can
// review where to collect their item any time from My Reports.
export const ClaimCollection = () => {
  const { currentMatch, matchLoading, navigateTo, openImage } = useAppContext();

  const found = currentMatch?.found_item;
  const type = found?.handover_type;
  const isPolice = type === 'POLICE';
  const label = isPolice ? 'Police Station' : type === 'INSTITUTION' ? 'Institution / Admin Desk' : 'Collection Point';
  const place = found?.handover_place;
  const lat = found?.handover_latitude;
  const lng = found?.handover_longitude;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container slide-up">
        <div className="match-header-bar" onClick={() => navigateTo('my-reports')}><ArrowLeft size={18} /> Back to Reports</div>

        {matchLoading && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-gray)' }}>Loading collection details…</div>
        )}

        {!matchLoading && !found && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-gray)' }}>
            Collection details are not available for this item.
          </div>
        )}

        {!matchLoading && found && (
          <div className="match-card">
            <div className="dashboard-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Ready for collection</h1>
              <p>The finder handed your item over at a {label.toLowerCase()}.</p>
            </div>

            {/* Item summary */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: '1.25rem' }}>
              {found.image && (
                <img src={found.image} alt={found.title} onClick={() => openImage(found.image)}
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontWeight: 800 }}>{found.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                  {[found.brand, found.color, found.category].filter(Boolean).join(' · ')}
                </div>
              </div>
            </div>

            {/* Collection point */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-dark)' }}>
              {isPolice ? <Building2 size={20} color="var(--primary)" /> : <Landmark size={20} color="var(--primary)" />} {label}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--text-gray)', marginBottom: '1rem' }}>
              <MapPin size={18} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ lineHeight: 1.5 }}>{place || 'Location shared by the finder.'}</span>
            </div>

            <MapView lat={lat} lng={lng} place={place} height={220} />

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-gray)' }}>
              <ShieldCheck size={16} color="#047857" /> Carry a valid photo ID to collect your item.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
