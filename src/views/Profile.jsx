import React, { useState } from 'react';
import { Bell, LogOut, CreditCard, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const PREF_KEY = 'lf_notif_prefs';
const DEFAULT_PREFS = { matches: true, claims: true, rewards: true };

function loadPrefs() {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

const Toggle = ({ on, onClick, label }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', cursor: 'pointer' }}>
    <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>{label}</span>
    <div style={{ width: 42, height: 24, borderRadius: 999, background: on ? 'var(--primary)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: on ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  </div>
);

export const Profile = () => {
  const { handleLogout, navigateTo, user } = useAppContext();

  const displayName = user?.full_name?.trim() || user?.email || 'User';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=035C43&color=fff`;

  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [saved, setSaved] = useState(false);

  const toggle = (key) => { setPrefs((p) => ({ ...p, [key]: !p[key] })); setSaved(false); };
  const savePrefs = () => {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
          <div className="profile-header-card">
             <div className="profile-cover"></div>
             <div className="profile-avatar-container">
                <img className="profile-avatar" src={avatarUrl} alt={displayName} />
             </div>
             <div className="profile-name">{displayName}</div>
             <div className="profile-email">{user?.email || ''}</div>
             {user?.phone_number && <div className="profile-email" style={{ marginTop: 2 }}>{user.phone_number}</div>}
          </div>

          <div className="settings-card" onClick={() => navigateTo('link-bank')} style={{ cursor: 'pointer' }}>
             <div className="settings-card-title" style={{ marginBottom: '4px' }}><CreditCard size={18} color="var(--primary)" /> Bank & Rewards</div>
             <div className="settings-desc" style={{ marginBottom: 0 }}>Link your bank account to send and receive rewards securely via Escrow.</div>
          </div>

          <div className="settings-card">
             <div className="settings-card-title"><Bell size={18}/> Notifications</div>
             <div className="settings-desc">Choose which alerts you want to receive.</div>

             {showPrefs && (
               <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.75rem', paddingTop: '0.25rem' }}>
                 <Toggle on={prefs.matches} onClick={() => toggle('matches')} label="AI match alerts" />
                 <Toggle on={prefs.claims} onClick={() => toggle('claims')} label="Handover & claim updates" />
                 <Toggle on={prefs.rewards} onClick={() => toggle('rewards')} label="Reward updates" />
                 <button className="btn-save-changes" style={{ marginTop: '0.75rem' }} onClick={savePrefs}>
                   {saved ? <><Check size={16} /> Saved</> : 'Save Preferences'}
                 </button>
               </div>
             )}

             {!showPrefs && (
               <button className="btn-update-outline" onClick={() => setShowPrefs(true)}>Update Preferences</button>
             )}
          </div>

          <button className="btn-logout-new" onClick={handleLogout}><LogOut size={18}/> Sign Out</button>
       </div>
    </div>
  );
};
