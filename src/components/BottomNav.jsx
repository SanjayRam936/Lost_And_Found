import React from 'react';
import { Home, List, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const BottomNav = () => {
  const { currentView, navigateTo, isLoggedIn } = useAppContext();

  if (!isLoggedIn || currentView === 'admin-dashboard' || currentView === 'match-detail' || currentView === 'report') {
    return null;
  }

  return (
    <div className="bottom-nav">
       <div className={`nav-item ${currentView==='dashboard'?'active':''}`} onClick={()=>navigateTo('dashboard')}>
         <Home size={20}/><span>Home</span>
       </div>
       <div className={`nav-item ${currentView==='my-reports'?'active':''}`} onClick={()=>navigateTo('my-reports')}>
         <List size={20}/><span>Reports</span>
       </div>
       <div className={`nav-item ${currentView==='account-settings'?'active':''}`} onClick={()=>navigateTo('account-settings')}>
         <User size={20}/><span>Profile</span>
       </div>
    </div>
  );
};
