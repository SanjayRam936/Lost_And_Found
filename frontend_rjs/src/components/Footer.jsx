import React from 'react';
import { ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Footer = () => {
  const { navigateTo, isLoggedIn } = useAppContext();

  return (
    <footer className="page-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
             <ShieldCheck size={24} className="text-primary" />
             <span className="brand-text">Lost&Found</span>
          </div>
          <p className="footer-tagline">AI-powered item recovery that respects your privacy.</p>
        </div>
        
        <div className="footer-links-grid">
          <div className="footer-column">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li onClick={() => navigateTo('home')}>Home</li>
              <li onClick={() => navigateTo(isLoggedIn ? 'report' : 'login')}>Report Item</li>
              <li onClick={() => navigateTo(isLoggedIn ? 'account-settings' : 'login')}>{isLoggedIn ? 'My Account' : 'Sign In'}</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Security</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-newsletter">
          <h4 className="footer-heading">Stay Updated</h4>
          <div className="newsletter-input-group">
            <input type="email" placeholder="Enter your email" className="newsletter-input" />
            <button className="btn-newsletter"><ArrowRight size={16}/></button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Lost & Found AI. All rights reserved.</p>
      </div>
    </footer>
  );
};
