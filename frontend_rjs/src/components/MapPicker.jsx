import React, { useEffect, useRef, useState } from 'react';
import { MapPin, LocateFixed } from 'lucide-react';
import { loadGoogleMaps, getMapsKey } from '../api/maps';
import { geoReverse } from '../api/geo';

const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 }; // Chennai

// Click / drag the pin on the Google map, or use current location → the place
// is shown in words (reverse-geocoded via the free OpenStreetMap geocoder).
export const MapPicker = ({ value, onChange, height = 240, fallbackPlaceholder = 'Enter location' }) => {
  const mapRef = useRef(null);
  const gRef = useRef({ map: null, marker: null });
  const [available, setAvailable] = useState(Boolean(getMapsKey()));
  const [place, setPlace] = useState(value?.place || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let active = true;
    loadGoogleMaps().then((ok) => {
      if (!active) return;
      setAvailable(ok);
      if (ok) init();
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = () => {
    const g = window.google;
    const start = value?.lat != null && value?.lng != null ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER;
    const map = new g.maps.Map(mapRef.current, {
      center: start, zoom: value?.lat != null ? 16 : 13,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
    });
    const marker = new g.maps.Marker({ position: start, map, draggable: true });
    gRef.current = { map, marker };

    map.addListener('click', (e) => { marker.setPosition(e.latLng); apply(e.latLng.lat(), e.latLng.lng()); });
    marker.addListener('dragend', (e) => apply(e.latLng.lat(), e.latLng.lng()));
  };

  // Chosen point → readable address (words), not lat/long.
  const apply = async (lat, lng) => {
    setPlace('Locating…');
    const address = await geoReverse(lat, lng);
    setPlace(address);
    onChange({ place: address, lat, lng });
  };

  const focus = (lat, lng) => {
    const { map, marker } = gRef.current;
    if (map && marker) { const pos = { lat, lng }; map.setCenter(pos); map.setZoom(16); marker.setPosition(pos); }
  };

  // Browser GPS → set to the user's current location (shown in words).
  const useMyLocation = () => {
    if (!navigator.geolocation) { setMsg('Geolocation is not supported by this browser.'); return; }
    setBusy(true); setMsg('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        focus(lat, lng);
        await apply(lat, lng);
        setBusy(false);
      },
      (err) => { setBusy(false); setMsg(err.code === 1 ? 'Location permission denied.' : 'Could not get your location.'); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // No API key -> plain text field for the place name/address.
  if (!available) {
    return (
      <input
        type="text"
        className="form-input"
        placeholder={fallbackPlaceholder}
        value={value?.place || ''}
        onChange={(e) => onChange({ place: e.target.value, lat: value?.lat ?? null, lng: value?.lng ?? null })}
      />
    );
  }

  return (
    <div>
      <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, background: 'var(--bg-alt)', minHeight: 46 }}>
        <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span style={{ color: place ? 'var(--text-dark)' : 'var(--text-light)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {place || 'Click on the map to pick a location'}
        </span>
      </div>

      <button type="button" className="btn-secondary" onClick={useMyLocation} disabled={busy}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.9rem', marginBottom: 8, position: 'relative', zIndex: 5 }}>
        <LocateFixed size={16} /> {busy ? 'Getting location…' : 'Use my current location'}
      </button>

      <div ref={mapRef} style={{ width: '100%', height, borderRadius: 8, border: '1px solid var(--border-light)' }} />

      <div style={{ fontSize: '0.75rem', color: msg ? 'var(--error)' : 'var(--text-gray)', marginTop: 6 }}>
        {msg || 'Click the map / drag the pin, or use your current location — the address appears above.'}
      </div>
    </div>
  );
};
