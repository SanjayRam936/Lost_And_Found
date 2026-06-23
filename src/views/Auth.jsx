import React from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Search, PlusCircle, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Login = () => {
  const { 
    email, setEmail, hasEmailError, 
    password, setPassword, showPassword, setShowPassword, 
    handleLoginSubmit, navigateTo 
  } = useAppContext();

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="card-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue</p>
        </div>
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <div className="label-container"><label className="form-label">Email</label></div>
            <div className={`input-wrapper ${hasEmailError ? '' : ''}`}>
              <Mail className="input-icon-left" size={18} />
              <input type="email" className="form-input" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <div className="label-container">
              <label className="form-label">Password</label>
              <span className="forgot-link">Forgot?</span>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input type={showPassword ? "text" : "password"} className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-submit">Sign In <ArrowRight size={18}/></button>
        </form>
        <div className="divider">OR</div>
        <div className="register-text">Don't have an account? <span className="register-link" onClick={() => navigateTo('register')}>Register</span></div>
        <div style={{textAlign: 'center', marginTop: '1rem'}}>
           <span className="register-link" style={{fontSize: '0.8rem'}} onClick={() => navigateTo('admin-login')}>Admin Login</span>
        </div>
      </div>
    </div>
  );
};

export const Register = () => {
  const {
    regType, setRegType,
    regName, setRegName,
    regEmail, setRegEmail,
    regPassword, setRegPassword,
    showRegPassword,
    passStrength,
    handleLoginSubmit, navigateTo
  } = useAppContext();

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="card-header">
          <h1>Create Account</h1>
          <p>Join the community</p>
        </div>
        <div className="type-selector">
          <div className={`type-card ${regType === 'lost' ? 'active' : ''}`} onClick={() => setRegType('lost')}>
            <Search className="type-card-icon" size={24} />
            <div className="type-card-text">Lost Item</div>
            {regType === 'lost' && <CheckCircle className="type-card-check" size={16} />}
          </div>
          <div className={`type-card ${regType === 'found' ? 'active' : ''}`} onClick={() => setRegType('found')}>
            <PlusCircle className="type-card-icon" size={24} />
            <div className="type-card-text">Found Item</div>
            {regType === 'found' && <CheckCircle className="type-card-check" size={16} />}
          </div>
        </div>
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
             <div className="input-wrapper">
              <User className="input-icon-left" size={18} />
              <input type="text" className="form-input" placeholder="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={18} />
              <input type="email" className="form-input" placeholder="University Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input type={showRegPassword ? "text" : "password"} className="form-input" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
            </div>
          </div>
          {regPassword && (
             <div className="password-strength-container">
               <div className="strength-bars">
                 <div className={`strength-bar ${passStrength >= 1 ? (passStrength === 1 ? 'weak' : (passStrength === 2 ? 'medium' : 'strong')) : ''}`}></div>
                 <div className={`strength-bar ${passStrength >= 2 ? (passStrength === 2 ? 'medium' : 'strong') : ''}`}></div>
                 <div className={`strength-bar ${passStrength >= 3 ? 'strong' : ''}`}></div>
               </div>
               <div className="strength-text">{passStrength === 1 ? 'Weak' : passStrength === 2 ? 'Medium' : 'Strong'}</div>
             </div>
          )}
          <button type="submit" className="btn-submit">Create Account</button>
        </form>
      </div>
    </div>
  );
};
