import React from 'react';
import { Search, Plus, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getStatusBadge } from '../utils/helpers';

export const Dashboard = () => {
  const { reports, navigateTo, user } = useAppContext();
  const firstName = user?.full_name?.trim()?.split(' ')[0] || 'there';
  const matchCount = reports.filter(r => r.status === 'matched').length;

  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
         <div className="dashboard-header">
           <span className="dash-overline">Dashboard</span>
           <h1>Welcome back, {firstName} 👋</h1>
           <p>Here's an overview of your reported items.</p>
         </div>

         <div className="dash-actions">
           <button className="action-btn action-btn-lost" onClick={() => navigateTo('report', null, { type: 'lost' })}>
             <span className="action-btn-icon"><Search size={22} /></span>
             <span className="action-btn-text">
               <span className="action-btn-title">Report Lost Item</span>
               <span className="action-btn-sub">Let our AI find it</span>
             </span>
             <ArrowRight className="action-btn-arrow" size={18} />
           </button>

           <button className="action-btn action-btn-found" onClick={() => navigateTo('report', null, { type: 'found' })}>
             <span className="action-btn-icon"><Plus size={22} /></span>
             <span className="action-btn-text">
               <span className="action-btn-title">Report Found Item</span>
               <span className="action-btn-sub">Help return it</span>
             </span>
             <ArrowRight className="action-btn-arrow" size={18} />
           </button>
         </div>

         <div className="dash-stats-grid">
            <div className="stat-card" onClick={() => navigateTo('my-reports')}>
              <div className="stat-card-top">
                <span className="stat-card-icon stat-icon-neutral"><FileText size={18} /></span>
                <span className="stat-card-label">Your Reports</span>
              </div>
              <div className="stat-card-value">{reports.length}</div>
            </div>
            <div className="stat-card" onClick={() => navigateTo('my-reports')}>
              <div className="stat-card-top">
                <span className="stat-card-icon stat-icon-purple"><Sparkles size={18} /></span>
                <span className="stat-card-label">AI Matches</span>
              </div>
              <div className="stat-card-value val-purple">{matchCount}</div>
            </div>
         </div>

         <div className="dash-recent">
            <div className="dash-recent-head">
              <h3>Recent Activity</h3>
              {reports.length > 0 && (
                <button className="dash-recent-link" onClick={() => navigateTo('my-reports')}>View all</button>
              )}
            </div>
            {reports.length === 0 && (
              <div className="dash-empty">No activity yet — report a lost or found item to get started.</div>
            )}
            {reports.slice(0, 3).map(r => (
               <div className="dash-activity-item" key={r.id} onClick={() => navigateTo('my-reports')}>
                 <div className="dash-activity-left">
                   <div className="dash-activity-icon">
                     {r.image ? <img src={r.image} alt={r.title} /> : <FileText size={16} />}
                   </div>
                   <div>
                     <div className="dash-activity-title">{r.title}</div>
                     <div className="dash-activity-meta">{r.date || `${r.type} report`}</div>
                   </div>
                 </div>
                 {getStatusBadge(r.status)}
               </div>
            ))}
         </div>
       </div>
    </div>
  );
};
