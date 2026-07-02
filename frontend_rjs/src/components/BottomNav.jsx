import React from 'react';
import { Home, List, Plus } from 'lucide-react';
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
       <div className={`nav-item ${currentView==='report'?'active':''}`} onClick={() => navigateTo('report')}>
         <Plus size={24} /><span>Report</span>
       </div>
       <div className={`nav-item ${currentView==='my-reports'?'active':''}`} onClick={()=>navigateTo('my-reports')}>
         <List size={24}/><span>My Reports</span>
       </div>
    </div>
  );
};
