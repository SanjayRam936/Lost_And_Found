// Pure, reusable validation helpers for the report forms.
// (Mirror the backend rules for instant client-side feedback; the backend is
//  still the source of truth and re-validates on submit.)

// ── Debounce ────────────────────────────────────────────────────────────────
export function debounce(fn, ms = 500) {
  let t;
  const wrapped = (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
  wrapped.cancel = () => clearTimeout(t);
  return wrapped;
}

// ── Character counts ────────────────────────────────────────────────────────
export function charCount(value, min, max) {
  const len = (value || '').trim().length;
  return {
    len,
    min,
    max,
    tooShort: len < min,
    tooLong: len > max,
    ok: len >= min && len <= max,
    remaining: Math.max(0, min - len), // chars still needed to reach the minimum
  };
}

// ── Simple client-side keyboard-mash / low-quality heuristic ────────────────
export function looksLikeMash(value) {
  const t = (value || '').trim().toLowerCase();
  if (!t) return false;
  if (/(.)\1{3,}/.test(t)) return true;                     // "aaaa"
  const compact = t.replace(/[^a-z0-9]/g, '');
  if (['qwerty', 'asdf', 'zxcvbn', 'asdfgh', 'test123', 'abcd'].some((s) => compact.includes(s))) return true;
  const letters = t.replace(/\s/g, '');
  if (letters.length >= 6 && new Set(letters).size / letters.length < 0.35) return true;
  return false;
}

// ── Image (client-side format/size check before upload) ─────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export function checkImageFile(file) {
  if (!file) return { valid: false, message: 'No file selected.' };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, message: 'Unsupported image format. Please use JPG, PNG, or WEBP.' };
  }
  if (file.size > MAX_BYTES) {
    return { valid: false, message: 'Image file size must not exceed 5MB.' };
  }
  return { valid: true, message: '', sizeLabel: `${(file.size / 1024 / 1024).toFixed(2)} MB` };
}

// ── IMEI (exactly 15 digits) ────────────────────────────────────────────────
export function isValidImei(value) {
  return /^\d{15}$/.test((value || '').trim());
}

// ── Unique-identifier fields to show per category ───────────────────────────
// (matches validation/constants.py UNIQUE_ID_CATEGORIES)
export function uniqueIdFieldsFor(category) {
  const map = {
    serial: ['Laptop & Computer', 'Camera'],
    imei: ['Phone & Tablets'],
    model: ['Laptop & Computer', 'Phone & Tablets', 'Camera', 'Watch'],
    reg: ['Pet'],
  };
  return {
    serial: map.serial.includes(category),
    imei: map.imei.includes(category),
    model: map.model.includes(category),
    reg: map.reg.includes(category),
  };
}

// ── Brand suggestions per category (shown after category is chosen) ─────────
export function brandSuggestionsFor(category) {
  const byCategory = {
    'Phone & Tablets': ['Apple', 'Samsung', 'OnePlus', 'Xiaomi'],
    'Laptop & Computer': ['Dell', 'HP', 'Lenovo', 'Asus', 'Apple'],
    'Watch': ['Casio', 'Titan', 'Fossil', 'Fastrack'],
    'Bag & Backpack': ['Wildcraft', 'Skybags', 'American Tourister', 'Nike'],
    'Earphones & Headphones': ['Sony', 'JBL', 'Boat', 'Bose'],
    'Clothing': ['Nike', 'Adidas', 'Puma'],
    'Spectacles': ['Ray-Ban', 'Fastrack'],
    'Camera': ['Sony', 'Canon', 'Nikon'],
  };
  return byCategory[category] || [];
}
