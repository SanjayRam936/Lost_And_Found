import React from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Full-screen image viewer. Opened via openImage(url) from AppContext.
export const ImageLightbox = () => {
  const { lightboxImage, closeImage } = useAppContext();

  React.useEffect(() => {
    if (!lightboxImage) return;
    const onKey = (e) => { if (e.key === 'Escape') closeImage(); };
    window.addEventListener('keydown', onKey);
    // Prevent the page behind from scrolling while the viewer is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxImage, closeImage]);

  if (!lightboxImage) return null;

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1100,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', cursor: 'zoom-out',
  };
  const closeBtn = {
    position: 'fixed', top: 16, right: 16, width: 42, height: 42, borderRadius: '50%',
    border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  };
  const img = {
    maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain',
    borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', cursor: 'default',
  };

  return (
    <div style={overlay} onClick={closeImage} role="dialog" aria-modal="true">
      <button style={closeBtn} onClick={closeImage} aria-label="Close image"><X size={22} /></button>
      <img src={lightboxImage} alt="Full view" style={img} onClick={(e) => e.stopPropagation()} />
    </div>
  );
};
