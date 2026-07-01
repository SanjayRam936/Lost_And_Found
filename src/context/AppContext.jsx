import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import * as authApi from '../api/auth';
import * as itemsApi from '../api/items';
import * as notificationsApi from '../api/notifications';
import * as matchesApi from '../api/matches';
import * as claimsApi from '../api/claims';
import { apiError, tokenStore } from '../api/client';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // State Management
  const [currentView, setCurrentView] = useState('home');
  const [currentParams, setCurrentParams] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Authenticated user + auth feedback
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const hasEmailError = false;

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('admin@lostfound.ai');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Register Form State
  const [regType, setRegType] = useState('lost'); 
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Profile/Reports State
  const [activeFilter, setActiveFilter] = useState('all');

  // Bank Payment States
  const [isBankLinked, setIsBankLinked] = useState(false); 
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Notifications State (loaded from the backend)
  const [notifications, setNotifications] = useState([]);
  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      setNotifications(await notificationsApi.listNotifications());
    } catch {
      // ignore — keep whatever we had
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  // Chat/Messages State (real data is fetched inside the Messages/ChatScreen views)
  const [conversations, setConversations] = useState([]);
  const unreadMessagesCount = 0;

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if(!chatInput.trim()) return;
    const newMsg = { id: Date.now(), type: 'sent', text: chatInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setChatMessages([...chatMessages, newMsg]);
    setChatInput('');
  };

  const handleDeleteMessage = (id) => {
    setChatMessages(chatMessages.filter(m => m.id !== id));
  };

  const handleSendAttachment = (type, e) => {
     let text = '';
     if(type === 'image' || type === 'photo') text = 'Sent a photo 📷';
     if(type === 'video') text = 'Sent a video 🎥';
     if(type === 'file' || type === 'document') text = 'Sent a document 📄';
     if(type === 'location') text = 'Shared live location 📍';
     if(type === 'reward') text = 'Sent a Reward 🎁';

     const newMsg = { id: Date.now(), type: 'sent', text: text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isSystem: type === 'reward' };
     setChatMessages([...chatMessages, newMsg]);
     
     if (e && e.target) e.target.value = null;
  };

  // Match Detail States
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [claimStep, setClaimStep] = useState('initial');

  // Claim & Handover Flow States
  const [claimRole, setClaimRole] = useState('owner'); // 'owner' or 'finder' for demo purposes
  const [generatedOtp, setGeneratedOtp] = useState('482913');

  // Real match/claim flow state
  const [currentMatch, setCurrentMatch] = useState(null);
  const [currentClaim, setCurrentClaim] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [handoverMethod, setHandoverMethod] = useState(''); // 'police' or 'custom'
  const [policeStationDetails, setPoliceStationDetails] = useState({
    name: 'Central Police Station',
    address: '123 Safety Ave, District 1',
    phone: '+1 (555) 123-4567',
    hours: '24/7'
  });
  const [customLocation, setCustomLocation] = useState('');

  // Security Section Visibility State
  const [showSecuritySection, setShowSecuritySection] = useState(true);

  // Password Strength Logic
  const getStrength = (pass) => {
    if (!pass) return 0;
    if (pass.length < 6) return 1;
    if (pass.length < 10) return 2;
    return 3;
  };
  const passStrength = getStrength(regPassword);

  // --- REPORTS (lost + found items) — loaded from the backend ---
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const emptyReportForm = {
    pk: null, type: 'lost', category: '', title: '', color: '', description: '', date: '', time: '', location: '', latitude: null, longitude: null, image: null, handoverMethod: 'direct', wantsReward: false,
    handoverPlace: '', handoverLat: null, handoverLng: null
  };
  const [reportForm, setReportForm] = useState(emptyReportForm);

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const data = await itemsApi.listMyReports();
      setReports(data);
      return data;
    } catch {
      return [];
    } finally {
      setReportsLoading(false);
    }
  };

  // Filtering Logic
  const filteredReports = reports.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'resolved') return r.status === 'resolved';
    return r.type === activeFilter;
  });
  // Escrow Timeline State
  const [escrowTimeline, setEscrowTimeline] = useState({
    paymentSecured: false,
    handoverConfirmed: false,
    rewardReleased: false
  });

  const confirmItemReceived = () => {
    setEscrowTimeline(prev => ({ ...prev, paymentSecured: true, handoverConfirmed: true }));
    navigateTo('rewards');
  };

  const confirmRewardPayment = () => {
    setEscrowTimeline(prev => ({ ...prev, rewardReleased: true }));
    // Dispatch notification to finder
    const newNotif = { id: Date.now(), type: 'reward', title: 'You have received a reward for returning an item.', time: 'Just now', read: false };
    setNotifications(prev => [newNotif, ...prev]);
    navigateTo('rewards');
  };

  // Navigation Handlers
  const navigateTo = (view, e = null, params = null) => {
    if (e && e.preventDefault) e.preventDefault();
    window.scrollTo(0, 0);
    
    setIsLoading(true);

    setTimeout(() => {
      setCurrentView(view);
      setCurrentParams(params || {});
      
      if (params?.regType) setRegType(params.regType);
      
      if (view === 'report' && !params?.editMode) {
        setReportForm({ ...emptyReportForm, type: params?.type || 'lost' });
      }

      if (view === 'match-detail') {
        setClaimStep('initial');
      }

      if (view === 'account-settings') {
        setShowSecuritySection(true);
      }
      
      setIsLoading(false);
    }, 400); // reduced from 600 for smoother navigation
  };

  // Apply an authenticated user to app state and route to the right home view.
  const applyAuthenticatedUser = (u, { redirect = true } = {}) => {
    setUser(u);
    setIsLoggedIn(true);
    const staff = Boolean(u?.is_staff);
    setIsAdmin(staff);
    fetchReports();
    fetchNotifications();
    if (redirect) {
      setCurrentView(staff ? 'admin-dashboard' : 'dashboard');
      window.scrollTo(0, 0);
    }
  };

  // Clear all auth state locally (used after logout or a failed token refresh).
  const clearSession = () => {
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setReports([]);
    setNotifications([]);
  };

  const handleLoginSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    setIsLoading(true);
    try {
      const u = await authApi.login(email, password);
      applyAuthenticatedUser(u);
      setPassword('');
    } catch (err) {
      setAuthError(apiError(err, 'Invalid email or password.'));
    } finally {
      setAuthLoading(false);
      setIsLoading(false);
    }
  };

  // Registration: backend returns tokens, so the user is logged straight in.
  const handleRegisterSubmit = async ({ fullName, email: regE, phone, password: regP, confirmPassword }) => {
    setAuthError('');
    setAuthLoading(true);
    setIsLoading(true);
    try {
      const u = await authApi.register({
        full_name: fullName,
        email: regE,
        phone_number: phone,
        password: regP,
        password2: confirmPassword,
      });
      applyAuthenticatedUser(u);
      return { ok: true };
    } catch (err) {
      const msg = apiError(err, 'Could not create account.');
      setAuthError(msg);
      return { ok: false, error: msg };
    } finally {
      setAuthLoading(false);
      setIsLoading(false);
    }
  };

  // Admin login uses the same endpoint; access is granted only to staff users.
  const handleAdminLoginSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    setIsLoading(true);
    try {
      const u = await authApi.login(adminEmail, adminPassword);
      if (!u?.is_staff) {
        setAuthError('This account does not have admin access.');
        await authApi.logout();
        clearSession();
        return;
      }
      setAdminPassword('');
      applyAuthenticatedUser(u);
    } catch (err) {
      setAuthError(apiError(err, 'Invalid admin credentials.'));
    } finally {
      setAuthLoading(false);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      clearSession();
      setCurrentView('home');
      window.scrollTo(0, 0);
      setIsLoading(false);
    }
  };

  // Restore the session on first load (if a refresh token is stored) and
  // react to forced logouts triggered by a failed token refresh.
  useEffect(() => {
    let active = true;
    (async () => {
      if (authApi.hasSession()) {
        try {
          const me = await authApi.getMe();
          if (active) applyAuthenticatedUser(me, { redirect: false });
        } catch {
          tokenStore.clear();
        }
      }
      if (active) setBootstrapping(false);
    })();

    const onForcedLogout = () => {
      clearSession();
      setCurrentView('login');
    };
    window.addEventListener('lf:logout', onForcedLogout);
    return () => {
      active = false;
      window.removeEventListener('lf:logout', onForcedLogout);
    };
  }, []);

  // --- CRUD HANDLERS (real API) ---
  const [reportError, setReportError] = useState('');

  const handleReportSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setReportError('');
    setIsLoading(true);
    try {
      if (reportForm.pk) {
        await itemsApi.updateReport(reportForm);
      } else {
        await itemsApi.createReport(reportForm);
      }
      await fetchReports();
      setReportForm(emptyReportForm);
      setCurrentView('my-reports');
      window.scrollTo(0, 0);
    } catch (err) {
      setReportError(apiError(err, 'Could not save the report.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReport = (report) => {
    setReportForm({ ...emptyReportForm, ...report, image: null });
    setCurrentView('report');
    window.scrollTo(0, 0);
  };

  const handleDeleteReport = async (report) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await itemsApi.deleteReport(report);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (err) {
      alert(apiError(err, 'Could not delete the report.'));
    }
  };

  // --- MATCH / CLAIM HANDLERS (real API) ---
  // Open the match-detail view for a given lost item (loads its top match).
  const loadMatchForLost = async (lostPk) => {
    setMatchLoading(true);
    setClaimError('');
    setCurrentMatch(null);
    try {
      const matches = await matchesApi.matchesForLost(lostPk);
      const top = matches[0] || null;
      setCurrentMatch(top);
      return top;
    } catch (err) {
      setClaimError(apiError(err, 'Could not load match.'));
      return null;
    } finally {
      setMatchLoading(false);
    }
  };

  // Owner initiates the claim -> generates the OTP (DIRECT) -> OTP screen.
  const handleInitiateClaim = async () => {
    if (!currentMatch) return;
    setClaimError('');
    setIsLoading(true);
    try {
      const claim = await claimsApi.initiateClaim(currentMatch.id);
      setCurrentClaim(claim);
      // POLICE / INSTITUTION: no OTP — show the collection-success screen.
      if (claim.handover_type !== 'DIRECT') {
        setCurrentView('claim-success');
      } else {
        setCurrentView('claim-otp-owner');
      }
      window.scrollTo(0, 0);
    } catch (err) {
      setClaimError(apiError(err, 'Could not start the claim.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateOtp = async () => {
    if (!currentClaim) return;
    try {
      const claim = await claimsApi.regenerateOtp(currentClaim.id);
      setCurrentClaim(claim);
    } catch (err) {
      setClaimError(apiError(err, 'Could not regenerate OTP.'));
    }
  };

  // Finder submits the OTP. Returns { ok, wantsReward } so the view can route.
  const handleVerifyOtp = async (otp) => {
    if (!currentClaim) return { ok: false };
    try {
      const res = await claimsApi.verifyOtp(currentClaim.id, otp);
      setCurrentClaim((prev) => (prev ? { ...prev, status: 'RESOLVED', otp_verified: true } : prev));
      fetchReports();
      fetchNotifications();
      return { ok: true, wantsReward: !!res.wants_reward };
    } catch (err) {
      return { ok: false, error: apiError(err, 'Incorrect OTP.') };
    }
  };

  const handleDismissMatch = async () => {
    if (!currentMatch) return;
    if (!window.confirm('This match will be removed. Proceed?')) return;
    try {
      await matchesApi.dismissMatch(currentMatch.id);
      await fetchReports();
      navigateTo('my-reports');
    } catch (err) {
      alert(apiError(err, 'Could not dismiss the match.'));
    }
  };

  // Finder opens the OTP submit page for one of their found items, scoped to
  // the claim the owner initiated on it. (The finder is a claim participant but
  // has no match visibility — they only need the match id for the chat.)
  const openFinderClaim = async (report) => {
    if (!report?.claim?.id) return;
    setClaimError('');
    setIsLoading(true);
    try {
      const claim = await claimsApi.getClaim(report.claim.id);
      setCurrentClaim(claim);
      setCurrentMatch({ id: report.claim.match_id });
      setCurrentView('claim-otp-finder');
      window.scrollTo(0, 0);
    } catch (err) {
      alert(apiError(err, 'Could not open the handover.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Finder opens their reward status page from the product list.
  const openFinderReward = async (report) => {
    if (!report?.claim?.id) return;
    setIsLoading(true);
    try {
      const claim = await claimsApi.getClaim(report.claim.id);
      setCurrentClaim(claim);
      setCurrentMatch({ id: report.claim.match_id });
      setCurrentView('finder-reward');
      window.scrollTo(0, 0);
    } catch (err) {
      alert(apiError(err, 'Could not open the reward page.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Owner opens the reward page for a resolved lost item from the product list.
  const openOwnerReward = async (report) => {
    if (!report?.claim?.id) return;
    setClaimError('');
    setIsLoading(true);
    try {
      const claim = await claimsApi.getClaim(report.claim.id);
      setCurrentClaim(claim);
      setCurrentMatch({ id: report.claim.match_id });
      setCurrentView('rewards');
      window.scrollTo(0, 0);
    } catch (err) {
      alert(apiError(err, 'Could not open the reward page.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectMatch = (id) => {
    if(window.confirm('This match will be removed. Proceed?')) {
      setReports(reports.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      alert("This match has been removed.");
      navigateTo('my-reports');
    }
  };

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView, currentParams, setCurrentParams, navigateTo,
      isLoggedIn, setIsLoggedIn, handleLoginSubmit, handleLogout,
      isAdmin, setIsAdmin, handleAdminLoginSubmit, handleRegisterSubmit,
      isLoading, setIsLoading,
      user, setUser, authError, setAuthError, authLoading, bootstrapping,
      
      email, setEmail, hasEmailError,
      password, setPassword, showPassword, setShowPassword,
      
      adminEmail, setAdminEmail, adminPassword, setAdminPassword, showAdminPassword, setShowAdminPassword,
      
      regType, setRegType, regName, setRegName, regEmail, setRegEmail, regPhone, setRegPhone,
      regPassword, setRegPassword, regConfirmPassword, setRegConfirmPassword, showRegPassword, setShowRegPassword,
      passStrength, getStrength,
      
      activeFilter, setActiveFilter,
      isBankLinked, setIsBankLinked, paymentMethod, setPaymentMethod,
      notifications, unreadNotificationsCount, fetchNotifications, markAllNotificationsRead,
      
      conversations, unreadMessagesCount,
      chatMessages, setChatMessages, chatInput, setChatInput, handleSendMessage, handleSendAttachment, handleDeleteMessage,
      imageInputRef, fileInputRef,
      
      isAuthorized, setIsAuthorized, claimStep, setClaimStep, showSecuritySection, setShowSecuritySection,
      
      reports, setReports, reportForm, setReportForm, filteredReports,
      fetchReports, reportsLoading, reportError,
      handleReportSubmit, handleEditReport, handleDeleteReport, handleRejectMatch,
      escrowTimeline, setEscrowTimeline, confirmItemReceived, confirmRewardPayment,
      claimRole, setClaimRole, generatedOtp, setGeneratedOtp, handoverMethod, setHandoverMethod,
      policeStationDetails, setPoliceStationDetails, customLocation, setCustomLocation,
      currentMatch, currentClaim, matchLoading, claimError,
      loadMatchForLost, handleInitiateClaim, handleRegenerateOtp, handleVerifyOtp, handleDismissMatch, openFinderClaim, openOwnerReward, openFinderReward
    }}>
      {children}
    </AppContext.Provider>
  );
};
