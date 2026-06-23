import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getStatusBadge } from '../utils/helpers';

export const Dashboard = () => {
  const { reports, navigateTo } = useAppContext();

  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
         <div className="dashboard-header">
           <h1>Overview</h1>
           <p>Welcome back, user.</p>
         </div>
         <div className="dash-actions">
           <div className="dash-action-card" onClick={() => navigateTo('report', null, { type: 'lost' })}>
             <div className="dash-action-icon icon-lost"><Search size={24} /></div>
             <div className="dash-action-text">
               <h3>Report Lost Item</h3>
               <p>Let our AI find your item.</p>
             </div>
           </div>
           <div className="dash-action-card" onClick={() => navigateTo('report', null, { type: 'found' })}>
             <div className="dash-action-icon icon-found"><Plus size={24} /></div>
             <div className="dash-action-text">
               <h3>Report Found Item</h3>
               <p>Help someone get their item back.</p>
             </div>
           </div>
         </div>
         
         <div className="dash-stats-grid">
            <div className="dash-stat-card">
              <div className="dash-stat-label">Your Reports</div>
              <div className="dash-stat-value val-black">{reports.length}</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-label">AI Matches</div>
              <div className="dash-stat-value val-purple">1</div>
            </div>
         </div>
         
         <div className="dash-recent">
            <h3>Recent Activity</h3>
            {reports.slice(0, 2).map(r => (
               <div className="dash-activity-item" key={r.id} onClick={() => navigateTo('my-reports')}>
                 <div className="dash-activity-left">
                   <div className="dash-activity-icon"><img src={r.image} alt={r.title} /></div>
                   <div>
                     <div className="dash-activity-title">{r.title}</div>
                     <div className="dash-activity-meta">{r.date}</div>
                   </div>
                 </div>
                 {getStatusBadge(r.status)}
               </div>
            ))}
            <button className="dash-view-all" onClick={() => navigateTo('my-reports')}>View All Activity</button>
         </div>
       </div>
    </div>
  );
};
