import React from 'react';
import { Pencil, Trash2, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getCategoryIcon, getStatusBadge } from '../utils/helpers';

export const MyReports = () => {
  const { activeFilter, setActiveFilter, filteredReports, handleEditReport, handleDeleteReport, navigateTo } = useAppContext();

  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
         <div className="reports-header">
           <h1>My Reports</h1>
           <p>Track the status of your items.</p>
         </div>
         <div className="filter-scroll">
            <button className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
            <button className={`filter-chip ${activeFilter === 'lost' ? 'active' : ''}`} onClick={() => setActiveFilter('lost')}>Lost Items</button>
            <button className={`filter-chip ${activeFilter === 'found' ? 'active' : ''}`} onClick={() => setActiveFilter('found')}>Found Items</button>
         </div>
         <div className="report-list">
            {filteredReports.map(r => (
               <div className="report-card" key={r.id}>
                 <div className="report-card-header">
                   <div className="report-category">{getCategoryIcon(r.category)} {r.category}</div>
                   <div className="report-actions">
                     <button onClick={() => handleEditReport(r)}><Pencil size={16} /></button>
                     <button onClick={() => handleDeleteReport(r.id)}><Trash2 size={16} /></button>
                   </div>
                 </div>
                 <div className="report-body">
                   <div className="report-img-box"><img src={r.image} alt={r.title} /></div>
                   <div className="report-info">
                     <div className="report-title">{r.title}</div>
                     <div className="report-meta"><MapPin size={12} style={{display:'inline', marginRight: 4}}/>{r.location}</div>
                     <div>{getStatusBadge(r.status)}</div>
                   </div>
                 </div>
                 {r.status === 'matched' && (
                    <button className="btn-card-action btn-purple-solid" onClick={() => navigateTo('match-detail')}>Review Match</button>
                 )}
               </div>
            ))}
            {filteredReports.length === 0 && (
               <div style={{textAlign: 'center', padding: '3rem 0', color: 'var(--text-gray)'}}>No reports found.</div>
            )}
         </div>
       </div>
    </div>
  );
};
