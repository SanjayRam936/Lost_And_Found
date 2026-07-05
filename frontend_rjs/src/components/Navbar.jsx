import React from 'react';
import { Bell, User, LogOut, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ShieldLogo } from './ShieldLogo';

// Views that are a natural "home" — no back button needed on these.
const ROOT_VIEWS = ['home', 'dashboard', 'login', 'register', 'admin-login', 'admin-dashboard'];

export const Navbar = () => {
  const { isLoggedIn, navigateTo, handleLogout, unreadNotificationsCount, currentView, goBack } = useAppContext();
  const showBack = !ROOT_VIEWS.includes(currentView);

  return (
    <nav className="navbar">
      <div className="nav-left">
        {showBack && (
          <button className="btn-nav-back" onClick={goBack} aria-label="Go back" title="Back">
            <ArrowLeft size={22} />
          </button>
        )}
        <div className="nav-brand" onClick={() => navigateTo(isLoggedIn ? 'dashboard' : 'home')}>
          <ShieldLogo />
          <span className="brand-text">Lost&Found</span>
        </div>
      </div>
      {isLoggedIn ? (
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
           <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigateTo('notifications')}>
             <Bell size={20} style={{ color: 'var(--text-gray)' }} />
             {unreadNotificationsCount > 0 && <span className="icon-badge">{unreadNotificationsCount}</span>}
           </div>
           <User size={20} style={{ color: 'var(--text-gray)', cursor: 'pointer' }} onClick={() => navigateTo('account-settings')} />
           <LogOut size={20} style={{ color: 'var(--text-gray)', cursor: 'pointer' }} onClick={handleLogout} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigateTo('login')}>Login</span>
        </div>
      )}
    </nav>
  );
};
