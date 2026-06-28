import React, { createContext, useContext, useState, useRef } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // State Management
  const [currentView, setCurrentView] = useState('home');
  const [currentParams, setCurrentParams] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login Form State
  const [email, setEmail] = useState('invalid-email-format');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const hasEmailError = true;

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

  // Notifications State
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'match', title: 'AI Match Found', time: '10 mins ago', read: false },
    { id: 2, type: 'message', title: 'New Message', time: '1 hour ago', read: false }
  ]);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Chat/Messages State
  const [conversations, setConversations] = useState([
    { id: 1, matchId: 1, name: 'Sarah M.', item: 'Black Leather Wallet', lastMessage: 'Thank you so much!', time: '2:50 PM', unread: 1, isOnline: true }
  ]);
  const unreadMessagesCount = conversations.reduce((acc, conv) => acc + conv.unread, 0);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'received', text: "Hi! I found your black Bellroy wallet near the South Entrance. I've handed it over to the Campus Security Desk.", time: "2:45 PM" },
    { id: 2, type: 'sent', text: "Thank you so much! I'll head over to the security desk now to pick it up. Did you leave any specific reference number?", time: "2:48 PM" },
    { id: 3, type: 'received', text: "No reference number, just show them this verified match screen. They know to expect you!", time: "2:50 PM", read: true }
  ]);
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

  // --- CRUD STATE MANAGEMENT ---
  const [reports, setReports] = useState([
    {
      id: 1, type: 'lost', status: 'matched', category: 'personal',
      title: 'Black Leather Wallet', date: '2023-10-24', location: 'Central Park South Entrance',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80&fit=crop'
    },
    {
      id: 2, type: 'lost', status: 'active', category: 'pets',
      title: "Golden Retriever 'Max'", date: '2023-10-22', location: 'City Park',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&q=80&fit=crop'
    }
  ]);

  const [reportForm, setReportForm] = useState({
    id: null, type: 'lost', category: '', title: '', color: '', description: '', date: '', time: '', location: '', image: null, handoverMethod: 'direct', wantsReward: false
  });

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
        setReportForm({ id: null, type: 'lost', category: '', title: '', color: '', description: '', date: '', time: '', location: '', image: null, handoverMethod: 'direct', wantsReward: false });
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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoggedIn(true);
      setCurrentView('dashboard'); 
      window.scrollTo(0, 0);
      setIsLoading(false);
    }, 800);
  };

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setCurrentView('admin-dashboard');
      window.scrollTo(0, 0);
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setCurrentView('home'); 
      setIsLoading(false);
    }, 600);
  };

  // --- CRUD HANDLERS ---
  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (reportForm.id) {
        setReports(reports.map(r => r.id === reportForm.id ? { ...r, ...reportForm } : r));
      } else {
        const newReport = { ...reportForm, id: Date.now(), status: 'active' };
        setReports([newReport, ...reports]);
      }
      setCurrentView('my-reports');
      window.scrollTo(0, 0);
      setIsLoading(false);
    }, 800);
  };

  const handleEditReport = (report) => {
    setReportForm(report);
    setCurrentView('report');
    window.scrollTo(0, 0);
  };

  const handleDeleteReport = (id) => {
    if(window.confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter(r => r.id !== id));
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
      isAdmin, setIsAdmin, handleAdminLoginSubmit,
      isLoading, setIsLoading,
      
      email, setEmail, hasEmailError,
      password, setPassword, showPassword, setShowPassword,
      
      adminEmail, setAdminEmail, adminPassword, setAdminPassword, showAdminPassword, setShowAdminPassword,
      
      regType, setRegType, regName, setRegName, regEmail, setRegEmail, regPhone, setRegPhone,
      regPassword, setRegPassword, regConfirmPassword, setRegConfirmPassword, showRegPassword, setShowRegPassword,
      passStrength, getStrength,
      
      activeFilter, setActiveFilter,
      isBankLinked, setIsBankLinked, paymentMethod, setPaymentMethod,
      notificationsRead, setNotificationsRead, notifications, unreadNotificationsCount,
      
      conversations, unreadMessagesCount,
      chatMessages, setChatMessages, chatInput, setChatInput, handleSendMessage, handleSendAttachment, handleDeleteMessage,
      imageInputRef, fileInputRef,
      
      isAuthorized, setIsAuthorized, claimStep, setClaimStep, showSecuritySection, setShowSecuritySection,
      
      reports, setReports, reportForm, setReportForm, filteredReports,
      handleReportSubmit, handleEditReport, handleDeleteReport, handleRejectMatch,
      escrowTimeline, setEscrowTimeline, confirmItemReceived, confirmRewardPayment,
      claimRole, setClaimRole, generatedOtp, setGeneratedOtp, handoverMethod, setHandoverMethod,
      policeStationDetails, setPoliceStationDetails, customLocation, setCustomLocation
    }}>
      {children}
    </AppContext.Provider>
  );
};
