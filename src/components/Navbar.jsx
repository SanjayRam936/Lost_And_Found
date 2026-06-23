import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ShieldLogo } from './ShieldLogo';

export const Navbar = () => {
  const { isLoggedIn, navigateTo, handleLogout } = useAppContext();

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigateTo('home')}>
        <ShieldLogo />
        <span className="brand-text">LostFound.ai</span>
      </div>
      {isLoggedIn ? (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <Bell size={20} style={{ color: 'var(--text-gray)', cursor: 'pointer' }} onClick={() => navigateTo('notifications')} />
           <User size={20} style={{ color: 'var(--text-gray)', cursor: 'pointer' }} onClick={() => navigateTo('account-settings')} />
           <LogOut size={20} style={{ color: 'var(--text-gray)', cursor: 'pointer' }} onClick={handleLogout} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigateTo('login')}>Login</span>
          <button className="btn-nav-register" onClick={() => navigateTo('register')}>Get Started</button>
        </div>
      )}
    </nav>
  );
};
