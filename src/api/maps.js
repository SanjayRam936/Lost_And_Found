// Lazy-loads the Google Maps JS API (with the Places library) using the key
// from VITE_GOOGLE_MAPS_API_KEY. Resolves false when no key is configured, so
// callers can fall back to a text-only experience.
let loadPromise = null;

export function getMapsKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
}

export function loadGoogleMaps() {
  const key = getMapsKey();
  if (!key) return Promise.resolve(false);
  if (window.google && window.google.maps) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
  return loadPromise;
}

export function mapsSearchLink({ lat, lng, place }) {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  if (place) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
  }
  return null;
}
