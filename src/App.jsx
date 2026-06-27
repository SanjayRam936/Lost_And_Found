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
import { Messages } from './views/Messages';
import { ChatScreen } from './views/ChatScreen';
import { ClaimFlow } from './views/ClaimFlow';
import { Rewards } from './views/Rewards';
import { FinderReward } from './views/FinderReward';
import { RewardPayment } from './views/RewardPayment';
import { LinkBank } from './views/LinkBank';
import { Footer } from './components/Footer';

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
    case 'messages': return <Messages />;
    case 'chat': return <ChatScreen />;
    case 'claim-flow': return <ClaimFlow />;
    case 'rewards': return <Rewards />;
    case 'reward-payment': return <RewardPayment />;
    case 'finder-reward': return <FinderReward />;
    case 'link-bank': return <LinkBank />;
    default: return <Home />;
  }
};

const AppContent = () => {
  const { currentView, isLoggedIn } = useAppContext();
  
  return (
    <div className={`app-container ${isLoggedIn ? 'has-bottom-nav' : ''}`}>
      <Navbar />
      <div className="main-content">
        <ViewRouter />
      </div>
      {isLoggedIn ? <BottomNav /> : <Footer />}
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
