// Free map + geocoding stack — CARTO/OpenStreetMap tiles (Leaflet) and
// Nominatim geocoding. No API key, no billing. Leaflet itself is loaded up-front
// in index.html so its CSS is applied before any map renders.

// Resolve once the (statically loaded) Leaflet global is available.
export function loadLeaflet() {
  if (window.L) return Promise.resolve(true);
  return new Promise((resolve) => {
    let tries = 0;
    const check = () => {
      if (window.L) return resolve(true);
      if (tries++ > 120) return resolve(false); // ~6s safety timeout
      setTimeout(check, 50);
    };
    check();
  });
}

// Clean, modern raster tiles (free, attribution required).
export function addTiles(map) {
  window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);
}

// Default Leaflet marker icon served from the CDN (avoids bundler path issues).
export function markerIcon() {
  return window.L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

// Forward geocode a text query -> { lat, lng, place } or null.
export async function geoSearch(query) {
  if (!query) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), place: data[0].display_name };
}

// Reverse geocode coordinates -> a readable address (falls back to coords).
export async function geoReverse(lat, lng) {
  const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    return data.display_name || fallback;
  } catch {
    return fallback;
  }
}
