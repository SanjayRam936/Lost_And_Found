import React from 'react';
import { MapPin, ArrowDown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { geoSearch } from '../api/geo';

// Feature 1 — ROUTE location: source + destination text inputs that geocode via
// Nominatim (free, no key). Emits patches ({ sourceLat, sourceLng, ... }) so the
// parent can merge into the latest form state without stale closures.
export const RouteLocationInput = ({ value, onChange, errors = {} }) => {
  const [srcText, setSrcText] = React.useState(value.sourceLocation || '');
  const [dstText, setDstText] = React.useState(value.destLocation || '');
  const [srcState, setSrcState] = React.useState(value.sourceLat != null ? 'ok' : 'idle'); // idle|loading|ok|error
  const [dstState, setDstState] = React.useState(value.destLat != null ? 'ok' : 'idle');

  const geocode = async (which, text) => {
    const t = (text || '').trim();
    const setState = which === 'src' ? setSrcState : setDstState;
    if (!t) { setState('idle'); return; }
    setState('loading');
    try {
      const r = await geoSearch(t);
      if (r) {
        setState('ok');
        onChange(which === 'src'
          ? { sourceLocation: r.place, sourceLat: r.lat, sourceLng: r.lng }
          : { destLocation: r.place, destLat: r.lat, destLng: r.lng });
      } else {
        setState('error');
        onChange(which === 'src'
          ? { sourceLocation: t, sourceLat: null, sourceLng: null }
          : { destLocation: t, destLat: null, destLng: null });
      }
    } catch {
      setState('error');
    }
  };

  const StatusIcon = ({ state }) => {
    if (state === 'loading') return <Loader2 size={16} className="spin" color="var(--primary)" />;
    if (state === 'ok') return <CheckCircle2 size={16} color="#047857" />;
    if (state === 'error') return <AlertCircle size={16} color="var(--error, #DC2626)" />;
    return <MapPin size={16} color="var(--text-gray)" />;
  };

  const fieldWrap = (err) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '0 0.75rem',
    border: `1.5px solid ${err ? 'var(--error, #DC2626)' : 'var(--border-light)'}`,
    borderRadius: 10, background: 'white',
  });

  return (
    <div>
      {/* Source */}
      <div style={fieldWrap(errors.source)}>
        <StatusIcon state={srcState} />
        <input
          className="form-input" style={{ border: 'none', padding: '0.75rem 0', background: 'transparent' }}
          placeholder="e.g. Chennai Central Station"
          value={srcText}
          onChange={(e) => { setSrcText(e.target.value); if (srcState !== 'idle') setSrcState('idle'); }}
          onBlur={() => geocode('src', srcText)}
        />
      </div>
      {srcState === 'ok' && value.sourceLocation && (
        <div style={{ fontSize: '0.75rem', color: '#047857', margin: '4px 0 0 4px' }}>✓ {value.sourceLocation}</div>
      )}
      {srcState === 'error' && (
        <div className="error-text" style={{ marginTop: 4 }}>Couldn’t find that place — try a more specific name.</div>
      )}
      {errors.source && <div className="error-text" style={{ marginTop: 4 }}>{errors.source}</div>}

      {/* Route arrow */}
      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', margin: '6px 0' }}>
        <ArrowDown size={20} />
      </div>

      {/* Destination */}
      <div style={fieldWrap(errors.dest)}>
        <StatusIcon state={dstState} />
        <input
          className="form-input" style={{ border: 'none', padding: '0.75rem 0', background: 'transparent' }}
          placeholder="e.g. Madurai Junction"
          value={dstText}
          onChange={(e) => { setDstText(e.target.value); if (dstState !== 'idle') setDstState('idle'); }}
          onBlur={() => geocode('dst', dstText)}
        />
      </div>
      {dstState === 'ok' && value.destLocation && (
        <div style={{ fontSize: '0.75rem', color: '#047857', margin: '4px 0 0 4px' }}>✓ {value.destLocation}</div>
      )}
      {dstState === 'error' && (
        <div className="error-text" style={{ marginTop: 4 }}>Couldn’t find that place — try a more specific name.</div>
      )}
      {errors.dest && <div className="error-text" style={{ marginTop: 4 }}>{errors.dest}</div>}

      <p style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '0.75rem' }}>
        We’ll search along this route corridor for matches instead of a single point.
      </p>
    </div>
  );
};
