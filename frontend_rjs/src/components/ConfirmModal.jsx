import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// App-wide confirmation dialog. Opened via `askConfirm(...)` in AppContext,
// which returns a Promise<boolean>. Replaces the native window.confirm().
export const ConfirmModal = () => {
  const { confirmConfig, resolveConfirm } = useAppContext();

  React.useEffect(() => {
    if (!confirmConfig) return;
    const onKey = (e) => {
      if (e.key === 'Escape') resolveConfirm(false);
      if (e.key === 'Enter') resolveConfirm(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmConfig, resolveConfirm]);

  if (!confirmConfig) return null;

  const {
    title = 'Are you sure?',
    message = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = false,
  } = confirmConfig;

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(15, 23, 42, 0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', backdropFilter: 'blur(2px)',
  };
  const card = {
    background: 'white', borderRadius: 16, width: '100%', maxWidth: 380,
    padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', textAlign: 'center',
  };
  const iconWrap = {
    width: 52, height: 52, borderRadius: '50%', margin: '0 auto 1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: danger ? '#FEE2E2' : 'var(--primary-light, #EEF2FF)',
    color: danger ? '#DC2626' : 'var(--primary, #6366F1)',
  };
  const btnBase = {
    flex: 1, padding: '0.75rem 1rem', borderRadius: 10, fontWeight: 600,
    cursor: 'pointer', border: '1px solid var(--border-light, #E5E7EB)', fontSize: '0.95rem',
  };

  return (
    <div style={overlay} onClick={() => resolveConfirm(false)} role="dialog" aria-modal="true">
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={iconWrap}><AlertTriangle size={26} /></div>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: 'var(--text-dark, #111827)' }}>{title}</h3>
        {message && <p style={{ margin: '0 0 1.25rem', color: 'var(--text-gray, #6B7280)', fontSize: '0.9rem', lineHeight: 1.5 }}>{message}</p>}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ ...btnBase, background: 'white', color: 'var(--text-gray, #6B7280)' }}
            onClick={() => resolveConfirm(false)}>{cancelText}</button>
          <button style={{ ...btnBase, border: 'none', color: 'white', background: danger ? '#DC2626' : 'var(--primary, #6366F1)' }}
            onClick={() => resolveConfirm(true)}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};
