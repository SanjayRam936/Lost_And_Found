import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { loadGoogleMaps, getMapsKey, mapsSearchLink } from '../api/maps';

// Read-only Google map marker for a POLICE/INSTITUTION collection location.
// Falls back to an "Open in Google Maps" link when no key/coords are available.
export const MapView = ({ lat, lng, place, height = 220 }) => {
  const mapRef = useRef(null);
  const [available, setAvailable] = useState(Boolean(getMapsKey()) && lat != null && lng != null);

  useEffect(() => {
    let active = true;
    if (lat == null || lng == null) { setAvailable(false); return; }
    loadGoogleMaps().then((ok) => {
      if (!active) return;
      setAvailable(ok);
      if (ok && mapRef.current) {
        const g = window.google;
        const center = { lat, lng };
        const map = new g.maps.Map(mapRef.current, {
          center, zoom: 16, mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
        });
        new g.maps.Marker({ position: center, map });
      }
    });
    return () => { active = false; };
  }, [lat, lng]);

  const link = mapsSearchLink({ lat, lng, place });

  if (!available) {
    return link ? (
      <a href={link} target="_blank" rel="noreferrer" className="btn-secondary"
         style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.6rem 1rem', textDecoration: 'none' }}>
        <MapPin size={16} /> Open in Google Maps <ExternalLink size={14} />
      </a>
    ) : null;
  }

  return <div ref={mapRef} style={{ width: '100%', height, borderRadius: 8, border: '1px solid var(--border-light)' }} />;
};
