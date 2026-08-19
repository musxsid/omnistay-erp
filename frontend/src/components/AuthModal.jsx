import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const AuthModal = ({ isOpen, onClose }) => {
  const { authenticateByEmail, verifyMobileOTP } = useAuth();
  
  const [authMode, setAuthMode] = useState('GUEST_MOBILE'); // GUEST_MOBILE, GUEST_EMAIL, STAFF
  const [phone, setPhone] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffRole, setStaffRole] = useState('admin@omnistay.com');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 7) {
      setError('Please enter a valid mobile number.');
      return;
    }
    setError('');
    setOtpStep(true);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    const res = await verifyMobileOTP(phone, otpCode);
    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    const targetEmail = authMode === 'STAFF' ? staffRole : email;
    const res = await authenticateByEmail(targetEmail, password || 'demo123');
    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-box" onClick={e => e.stopPropagation()}>
        <button 
          className="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Official Brand Header Component */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <BrandLogo subtitle="AUTHENTICATION GATEWAY" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>
            Sign in to access your resort reservations or staff command center.
          </p>
        </div>

        {/* Mode Selector Segmented Tabs */}
        <div className="auth-mode-tabs-container">
          <button 
            type="button"
            className={`auth-mode-tab ${authMode === 'GUEST_MOBILE' ? 'active' : ''}`}
            onClick={() => { setAuthMode('GUEST_MOBILE'); setOtpStep(false); setError(''); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <rect x="5" y="2" width="14" height="20"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            Mobile & OTP
          </button>
          
          <button 
            type="button"
            className={`auth-mode-tab ${authMode === 'GUEST_EMAIL' ? 'active' : ''}`}
            onClick={() => { setAuthMode('GUEST_EMAIL'); setError(''); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M4 4h16v16H4z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Guest Email
          </button>

          <button 
            type="button"
            className={`auth-mode-tab ${authMode === 'STAFF' ? 'active' : ''}`}
            onClick={() => { setAuthMode('STAFF'); setError(''); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <rect x="3" y="11" width="18" height="11"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Staff & Admin
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="auth-error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* 1. Mobile + OTP Flow */}
        {authMode === 'GUEST_MOBILE' && (
          <div>
            {!otpStep ? (
              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Mobile Phone Number
                  </label>
                  <div className="input-with-icon-wrapper">
                    <span className="input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </span>
                    <input 
                      type="tel" 
                      required 
                      className="form-input-with-icon" 
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary-azure" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  Send Verification OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', background: '#F8FAFC', padding: '8px', border: '1px solid var(--border-subtle)' }}>
                  OTP sent to <strong style={{ color: 'var(--text-main)' }}>{phone}</strong>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center' }}>
                    6-Digit Verification Code
                  </label>
                  <input 
                    type="text" 
                    maxLength={6}
                    required 
                    className="form-input-custom" 
                    placeholder="123456"
                    style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 800, padding: '10px 14px' }}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary-azure" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  Verify & Sign In
                </button>
                <button 
                  type="button" 
                  onClick={() => setOtpStep(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}
                >
                  ← Change Phone Number
                </button>
              </form>
            )}
          </div>
        )}

        {/* 2. Guest Email Flow */}
        {authMode === 'GUEST_EMAIL' && (
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Email Address
              </label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M4 4h16v16H4z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input 
                  type="email" 
                  required 
                  className="form-input-with-icon" 
                  placeholder="guest@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Password
              </label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <rect x="3" y="11" width="18" height="11"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input 
                  type="password" 
                  required 
                  className="form-input-with-icon" 
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary-azure" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              Sign In to Guest Portal
            </button>
          </form>
        )}

        {/* 3. Staff & Admin Domain Access */}
        {authMode === 'STAFF' && (
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Staff Operational Domain
              </label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </span>
                <select 
                  className="form-select-custom-iconic"
                  value={staffRole}
                  onChange={e => setStaffRole(e.target.value)}
                >
                  <option value="admin@omnistay.com">System Admin (Full Enterprise Control)</option>
                  <option value="frontdesk@omnistay.com">Front Desk Realm (Check-In & Matrix)</option>
                  <option value="housekeeping@omnistay.com">Housekeeping Realm (Room Status & Cleaning)</option>
                  <option value="restaurant@omnistay.com">Restaurant POS Realm (Dining & Folio Charge)</option>
                </select>
                <span className="select-dropdown-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Staff Access Key
              </label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <rect x="3" y="11" width="18" height="11"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input 
                  type="password" 
                  required 
                  className="form-input-with-icon" 
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary-azure" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              Enter Staff Workspace
            </button>
          </form>
        )}

        {/* Keycloak Realm Sync Security Badge */}
        <div className="keycloak-sync-badge">
          <span className="keycloak-active-dot"></span>
          <span>KEYCLOAK REALM 'OMNISTAY' AUTO-PROVISIONING ENABLED</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
