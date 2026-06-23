import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ShieldLogo } from './components/ShieldLogo';
import { Home } from './views/Home';
import { Login, Register } from './views/Auth';
import { Dashboard } from './views/Dashboard';
import { ReportItem } from './views/ReportItem';
import { MyReports } from './views/MyReports';
import { MatchDetail } from './views/MatchDetail';
import { Profile } from './views/Profile';
import { AdminDashboard } from './views/AdminDashboard';
import { Notifications } from './views/Notifications';

const ViewRouter = () => {
  const { currentView, isLoading } = useAppContext();

  if (isLoading) return (
    <div className="loading-wrapper">
      <div className="loading-logo-container"><ShieldLogo size={48} /></div>
      <div className="spinner"></div>
      <div className="loading-text">LostFound.ai</div>
    </div>
  );

  switch(currentView) {
    case 'home': return <Home />;
    case 'login': return <Login />;
    case 'register': return <Register />;
    case 'dashboard': return <Dashboard />;
    case 'report': return <ReportItem />;
    case 'my-reports': return <MyReports />;
    case 'account-settings': return <Profile />;
    case 'match-detail': return <MatchDetail />;
    case 'admin-dashboard': return <AdminDashboard />;
    case 'admin-login': return <Login />;
    case 'notifications': return <Notifications />;
    default: return <Home />;
  }
};

const AppContent = () => {
  const { currentView, isLoggedIn } = useAppContext();
  
  return (
    <div className="app-container">
      <Navbar />
      <ViewRouter />
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
