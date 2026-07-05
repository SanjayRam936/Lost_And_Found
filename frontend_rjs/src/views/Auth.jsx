import React from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Search, PlusCircle, CheckCircle, Phone } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Login = () => {
  const {
    currentView,
    email, setEmail,
    password, setPassword, showPassword, setShowPassword,
    adminEmail, setAdminEmail, adminPassword, setAdminPassword, showAdminPassword, setShowAdminPassword,
    handleLoginSubmit, handleAdminLoginSubmit,
    authError, setAuthError, authLoading, navigateTo,
  } = useAppContext();

  const isAdminLogin = currentView === 'admin-login';

  // Bind to the admin fields/handler when on the admin-login view.
  const curEmail = isAdminLogin ? adminEmail : email;
  const setCurEmail = isAdminLogin ? setAdminEmail : setEmail;
  const curPassword = isAdminLogin ? adminPassword : password;
  const setCurPassword = isAdminLogin ? setAdminPassword : setPassword;
  const showPw = isAdminLogin ? showAdminPassword : showPassword;
  const setShowPw = isAdminLogin ? setShowAdminPassword : setShowPassword;
  const onSubmit = isAdminLogin ? handleAdminLoginSubmit : handleLoginSubmit;

  React.useEffect(() => { setAuthError(''); }, [currentView, setAuthError]);

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="card-header">
          <h1>{isAdminLogin ? 'Admin Login' : 'Welcome Back'}</h1>
          <p>{isAdminLogin ? 'Sign in to the admin console' : 'Sign in to continue'}</p>
        </div>
        <form onSubmit={onSubmit}>
          {authError && <div className="error-text" style={{ marginBottom: '1rem' }}>{authError}</div>}
          <div className="form-group">
            <div className="label-container"><label className="form-label">Email</label></div>
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={18} />
              <input type="email" className="form-input" placeholder="you@university.edu" value={curEmail} onChange={(e) => setCurEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <div className="label-container">
              <label className="form-label">Password</label>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input type={showPw ? "text" : "password"} className="form-input" placeholder="••••••••" value={curPassword} onChange={(e) => setCurPassword(e.target.value)} required />
              <button type="button" className="input-icon-right" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-submit" disabled={authLoading}>
            {authLoading ? 'Signing In…' : <>Sign In <ArrowRight size={18}/></>}
          </button>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span className="forgot-link" style={{ fontSize: '0.85rem' }}>Forgot password?</span>
          </div>
        </form>
        {!isAdminLogin && (
          <>
            <div className="divider">OR</div>
            <div className="register-text">Don't have an account? <span className="register-link" onClick={() => navigateTo('register')}>Register</span></div>
            <div style={{textAlign: 'center', marginTop: '1rem'}}>
               <span className="register-link" style={{fontSize: '0.8rem'}} onClick={() => navigateTo('admin-login')}>Admin Login</span>
            </div>
          </>
        )}
        {isAdminLogin && (
          <div style={{textAlign: 'center', marginTop: '1rem'}}>
             <span className="register-link" style={{fontSize: '0.8rem'}} onClick={() => navigateTo('login')}>← Back to user login</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const Register = () => {
  const {
    regType, setRegType,
    regName, setRegName,
    regEmail, setRegEmail,
    regPhone, setRegPhone,
    regPassword, setRegPassword,
    regConfirmPassword, setRegConfirmPassword,
    showRegPassword, setShowRegPassword,
    passStrength,
    handleRegisterSubmit, authError, authLoading, navigateTo
  } = useAppContext();

  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const validateName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return "Full Name is required.";
    if (!/^[A-Za-z\s]+$/.test(trimmed)) return "Full Name must contain only letters.";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required.";
    // Accept any valid email format; the backend blocks fake/disposable domains.
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) return "Please enter a valid email address.";
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return "Phone Number is required.";
    if (!/^\d{10}$/.test(phone)) return "Phone Number must contain exactly 10 digits.";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required.";
    if (password.length < 8 || password.length > 32) return "Password must be at least 8 characters long.";
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Confirm Password is required.";
    if (confirmPassword !== password) return "Passwords do not match.";
    return "";
  };

  const handleNameChange = (e) => {
    let val = e.target.value;
    setRegName(val);
    if (touched.name) setErrors(prev => ({ ...prev, name: validateName(val) }));
  };
  
  const handleEmailChange = (e) => {
    setRegEmail(e.target.value);
    if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 10) val = val.slice(0, 10);
    setRegPhone(val);
    if (touched.phone) setErrors(prev => ({ ...prev, phone: validatePhone(val) }));
  };

  const handlePasswordChange = (e) => {
    let val = e.target.value;
    if (val.length > 32) val = val.slice(0, 32);
    setRegPassword(val);
    if (touched.password) setErrors(prev => ({ ...prev, password: validatePassword(val) }));
    if (touched.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(regConfirmPassword, val) }));
  };

  const handleConfirmPasswordChange = (e) => {
    let val = e.target.value;
    setRegConfirmPassword(val);
    if (touched.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(val, regPassword) }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let err = "";
    switch(field) {
      case 'name': err = validateName(regName); break;
      case 'email': err = validateEmail(regEmail); break;
      case 'phone': err = validatePhone(regPhone); break;
      case 'password': err = validatePassword(regPassword); break;
      case 'confirmPassword': err = validateConfirmPassword(regConfirmPassword, regPassword); break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateName(regName);
    const emailErr = validateEmail(regEmail);
    const phoneErr = validatePhone(regPhone);
    const passErr = validatePassword(regPassword);
    const confirmErr = validateConfirmPassword(regConfirmPassword, regPassword);

    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    });

    setErrors({
      name: nameErr,
      email: emailErr,
      phone: phoneErr,
      password: passErr,
      confirmPassword: confirmErr
    });

    if (!nameErr && !emailErr && !phoneErr && !passErr && !confirmErr) {
      // On success the context logs the user in and redirects to the dashboard.
      await handleRegisterSubmit({
        fullName: regName.trim(),
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="card-header">
          <h1>Create Account</h1>
          <p>Join the community</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: errors.name ? '1.5rem' : '1rem' }}>
             <div className={`input-wrapper ${errors.name ? 'error-border' : ''}`}>
              <User className="input-icon-left" size={18} />
              <input type="text" className="form-input" placeholder="Full Name" value={regName} onChange={handleNameChange} onBlur={() => handleBlur('name')} />
            </div>
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: errors.email ? '1.5rem' : '1rem' }}>
            <div className={`input-wrapper ${errors.email ? 'error-border' : ''}`}>
              <Mail className="input-icon-left" size={18} />
              <input type="email" className="form-input" placeholder="Email" value={regEmail} onChange={handleEmailChange} onBlur={() => handleBlur('email')} />
            </div>
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: errors.phone ? '1.5rem' : '1rem' }}>
            <div className={`input-wrapper ${errors.phone ? 'error-border' : ''}`}>
              <Phone className="input-icon-left" size={18} />
              <input type="tel" className="form-input" placeholder="Phone Number" value={regPhone} onChange={handlePhoneChange} onBlur={() => handleBlur('phone')} maxLength={10} />
            </div>
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: errors.password ? '1.5rem' : '1rem' }}>
            <div className={`input-wrapper ${errors.password ? 'error-border' : ''}`}>
              <Lock className="input-icon-left" size={18} />
              <input type={showRegPassword ? "text" : "password"} className="form-input" placeholder="Password" value={regPassword} onChange={handlePasswordChange} onBlur={() => handleBlur('password')} maxLength={32} />
              <button type="button" className="input-icon-right" onClick={() => setShowRegPassword(!showRegPassword)}>
                {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: errors.confirmPassword ? '1.5rem' : '1rem' }}>
            <div className={`input-wrapper ${errors.confirmPassword ? 'error-border' : ''}`}>
              <Lock className="input-icon-left" size={18} />
              <input type={showRegPassword ? "text" : "password"} className="form-input" placeholder="Confirm Password" value={regConfirmPassword} onChange={handleConfirmPasswordChange} onBlur={() => handleBlur('confirmPassword')} maxLength={32} />
            </div>
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>
          {regPassword && (
             <div className="password-strength-container" style={{ marginBottom: '1rem' }}>
               <div className="strength-bars">
                 <div className={`strength-bar ${passStrength >= 1 ? (passStrength === 1 ? 'weak' : (passStrength === 2 ? 'medium' : 'strong')) : ''}`}></div>
                 <div className={`strength-bar ${passStrength >= 2 ? (passStrength === 2 ? 'medium' : 'strong') : ''}`}></div>
                 <div className={`strength-bar ${passStrength >= 3 ? 'strong' : ''}`}></div>
               </div>
               <div className="strength-text">{passStrength === 1 ? 'Weak' : passStrength === 2 ? 'Medium' : 'Strong'}</div>
             </div>
          )}
          {authError && <div className="error-text" style={{ marginBottom: '1rem' }}>{authError}</div>}
          <button type="submit" className="btn-submit" disabled={authLoading}>
            {authLoading ? 'Creating Account…' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span className="register-text" style={{ fontSize: '0.85rem' }}>
              Already have an account? <span className="register-link" onClick={() => navigateTo('login')}>Sign In</span>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
