import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Notifications = () => {
  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
          <div className="reports-header">
            <h1>Notifications</h1>
          </div>
          <div className="notification-list">
             <div className="notification-card notification-unread">
                <div className="notif-icon-box" style={{background:'#EEF2FF', color:'#6366F1'}}><Sparkles size={20}/></div>
                <div className="notif-content">
                   <div className="notif-title-row">Match Found!</div>
                   <div className="notif-desc">We found a possible match for your "Black Wallet".</div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
