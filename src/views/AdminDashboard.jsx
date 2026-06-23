import React from 'react';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ShieldLogo } from '../components/ShieldLogo';

export const AdminDashboard = () => {
  const { handleLogout } = useAppContext();

  return (
    <div className="admin-layout">
       <div className="admin-sidebar">
          <div className="admin-sidebar-header">
             <ShieldLogo /> <span style={{fontWeight: 700, color: 'var(--text-dark)'}}>Admin Portal</span>
          </div>
          <div className="admin-nav">
             <button className="admin-nav-item active"><LayoutDashboard size={18}/> Overview</button>
             <button className="admin-nav-item"><Users size={18}/> Users</button>
             <button className="admin-nav-item" onClick={handleLogout}><LogOut size={18}/> Exit Admin</button>
          </div>
       </div>
       <div className="admin-content">
          <div className="admin-topbar">
             <h3>Dashboard Overview</h3>
          </div>
          <div className="admin-main-area">
             <div className="admin-stats-row">
                <div className="admin-stat-card">
                   <div style={{fontSize:'0.8rem', color:'#64748B', fontWeight:600}}>Total Active Reports</div>
                   <div className="admin-stat-value">124</div>
                </div>
                <div className="admin-stat-card">
                   <div style={{fontSize:'0.8rem', color:'#64748B', fontWeight:600}}>Matches Today</div>
                   <div className="admin-stat-value">12</div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
