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
import { Rewards } from './views/Rewards';
import { ClaimOtpOwner } from './views/ClaimOtpOwner';
import { ClaimVerifyOwnership } from './views/ClaimVerifyOwnership';
import { ClaimOtpFinder } from './views/ClaimOtpFinder';
import { ClaimHandoverMethod } from './views/ClaimHandoverMethod';
import { ClaimPoliceStationFinder } from './views/ClaimPoliceStationFinder';
import { ClaimPoliceStationOwner } from './views/ClaimPoliceStationOwner';
import { ClaimCustomLocationFinder } from './views/ClaimCustomLocationFinder';
import { ClaimCustomLocationOwner } from './views/ClaimCustomLocationOwner';
import { ClaimSuccess } from './views/ClaimSuccess';
import { ClaimCollection } from './views/ClaimCollection';
import { FinderReward } from './views/FinderReward';
import { RewardPayment } from './views/RewardPayment';
import { LinkBank } from './views/LinkBank';
import { Footer } from './components/Footer';
import { ConfirmModal } from './components/ConfirmModal';
import { ImageLightbox } from './components/ImageLightbox';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages a logged-out visitor is allowed to see. Everything else requires auth.
const PUBLIC_VIEWS = ['home', 'login', 'register', 'admin-login'];

const ViewRouter = () => {
  const { currentView, isLoading, bootstrapping, isLoggedIn } = useAppContext();

  // While the initial session check runs, show the loader instead of flashing
  // the public landing page (which looked like being logged out on refresh).
  if (bootstrapping || isLoading) return (
    <div className="loading-wrapper">
      <div className="loading-logo-container"><ShieldLogo size={48} /></div>
      <div className="spinner"></div>
      <div className="loading-text">LostFound.ai</div>
    </div>
  );

  // Auth guard: a logged-out user cannot reach any protected page (e.g. Report)
  // no matter how they navigate there — they get the login screen instead.
  if (!isLoggedIn && !PUBLIC_VIEWS.includes(currentView)) {
    return <Login />;
  }

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
    case 'claim-verify': return <ClaimVerifyOwnership />;
    case 'claim-otp-owner': return <ClaimOtpOwner />;
    case 'claim-otp-finder': return <ClaimOtpFinder />;
    case 'claim-handover-method': return <ClaimHandoverMethod />;
    case 'claim-police-station-finder': return <ClaimPoliceStationFinder />;
    case 'claim-police-station-owner': return <ClaimPoliceStationOwner />;
    case 'claim-custom-location-finder': return <ClaimCustomLocationFinder />;
    case 'claim-custom-location-owner': return <ClaimCustomLocationOwner />;
    case 'claim-success': return <ClaimSuccess />;
    case 'claim-collection': return <ClaimCollection />;
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
      <ConfirmModal />
      <ImageLightbox />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
