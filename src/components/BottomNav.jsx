import React from 'react';
import { Home, List, User, Plus, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const BottomNav = () => {
  const { currentView, navigateTo, isLoggedIn } = useAppContext();

  if (!isLoggedIn || currentView === 'admin-dashboard') {
    return null;
  }

  return (
    <div className="bottom-nav">
       <div className={`nav-item ${currentView==='dashboard'?'active':''}`} onClick={()=>navigateTo('dashboard')}>
         <Home size={24}/><span>Home</span>
       </div>
       <div className="nav-item-report" onClick={() => navigateTo('report')}>
         <div className="nav-item-report-icon"><Plus size={24} /></div>
         <span>Report</span>
       </div>
       <div className={`nav-item ${currentView==='my-reports'?'active':''}`} onClick={()=>navigateTo('my-reports')}>
         <List size={24}/><span>My Reports</span>
       </div>
       <div className={`nav-item ${currentView==='messages'?'active':''}`} onClick={()=>navigateTo('messages')}>
         <MessageSquare size={24}/><span>Messages</span>
       </div>
       <div className={`nav-item ${currentView==='account-settings'?'active':''}`} onClick={()=>navigateTo('account-settings')}>
         <User size={24}/><span>Profile</span>
       </div>
    </div>
  );
};
