import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const AuthModal = ({ isOpen, onClose, defaultRole = 'GUEST' }) => {
  const { 
    authenticateByCredentials, 
    registerBackendUser, 
    sendMobileOTP, 
    verifyMobileOTP 
  } = useAuth();
  
  // Primary Tabs: SIGN_IN | SIGN_UP
  const [activeTab, setActiveTab] = useState('SIGN_IN');
  
  // Portal Category: GUEST vs STAFF
  const [portalCategory, setPortalCategory] = useState(defaultRole === 'GUEST' ? 'GUEST' : 'STAFF');
  
  // Active Staff Sub-Role: STAFF_RESTAURANT | STAFF_HOUSEKEEPING | STAFF_FRONTDESK | ADMIN
  const [staffRole, setStaffRole] = useState('STAFF_RESTAURANT');

  // Computed targetRole for Backend Verification
  const targetRole = portalCategory === 'GUEST' ? 'GUEST' : staffRole;

  // Sign In Method: CREDENTIALS | MOBILE_OTP
  const [loginMethod, setLoginMethod] = useState('CREDENTIALS');
  
  // Form State: Sign In
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Form State: Mobile OTP
  const [phone, setPhone] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [activeOtpNotice, setActiveOtpNotice] = useState(null);
  
  // Form State: Sign Up (Username, Email, Phone, Password, Terms)
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupTermsAccepted, setSignupTermsAccepted] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setError('');
    setIsLoading(false);
    setOtpStep(false);
    setOtpCode('');
  };

  // Quick Demo Credentials Auto-Fill
  const fillDemoCredentials = (role) => {
    setError('');
    if (role === 'GUEST') {
      setPortalCategory('GUEST');
      setIdentifier('guest');
      setPassword('guest123');
      setPhone('9876543210');
    } else if (role === 'STAFF_RESTAURANT') {
      setPortalCategory('STAFF');
      setStaffRole('STAFF_RESTAURANT');
      setIdentifier('restaurant');
      setPassword('rest123');
      setPhone('9123456789');
    } else if (role === 'STAFF_HOUSEKEEPING') {
      setPortalCategory('STAFF');
      setStaffRole('STAFF_HOUSEKEEPING');
      setIdentifier('housekeeping');
      setPassword('hk123');
      setPhone('9234567890');
    } else if (role === 'STAFF_FRONTDESK') {
      setPortalCategory('STAFF');
      setStaffRole('STAFF_FRONTDESK');
      setIdentifier('frontdesk');
      setPassword('fd123');
      setPhone('9345678901');
    } else if (role === 'ADMIN') {
      setPortalCategory('STAFF');
      setStaffRole('ADMIN');
      setIdentifier('admin');
      setPassword('admin123');
      setPhone('9999999999');
    }
  };

  // 1. Credentials Login Handler (with Strict Role Verification)
  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await authenticateByCredentials(identifier, password, targetRole);
    setIsLoading(false);

    if (res.success) {
      resetState();
      onClose();
    } else {
      setError(res.message || 'Authentication failed for the selected role.');
    }
  };

  // 2. Mobile OTP Dispatch Handler
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 7) {
      setError('Please enter a valid mobile number.');
      return;
    }
    setError('');
    setIsLoading(true);
    
    const res = await sendMobileOTP(phone);
    setIsLoading(false);

    if (res.success) {
      setActiveOtpNotice(res);
      setOtpCode(res.otp || '123456');
      setOtpStep(true);
    } else {
      setError(res.message || 'Failed to dispatch OTP verification code.');
    }
  };

  // 3. Mobile OTP Verification Handler (with Role Lock)
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await verifyMobileOTP(phone, otpCode, targetRole);
    setIsLoading(false);

    if (res.success) {
      resetState();
      onClose();
    } else {
      setError(res.message || 'Verification failed. Invalid OTP code or role mismatch.');
    }
  };

  // 4. Backend Registration Handler
  const handleBackendSignup = async (e) => {
    e.preventDefault();
    if (!signupTermsAccepted) {
      setError('You must accept the Terms of Service to create an account.');
      return;
    }
    setError('');
    setIsLoading(true);

    const res = await registerBackendUser({
      username: signupUsername,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
      role: targetRole,
      termsAccepted: signupTermsAccepted
    });

    setIsLoading(false);

    if (res.success) {
      resetState();
      onClose();
    } else {
      setError(res.message || 'Registration failed. Please check your information.');
    }
  };

  const getRoleDisplayName = () => {
    if (portalCategory === 'GUEST') return 'Guest Portal';
    switch (staffRole) {
      case 'STAFF_RESTAURANT': return 'Restaurant POS';
      case 'STAFF_HOUSEKEEPING': return 'Housekeeping';
      case 'STAFF_FRONTDESK': return 'Front Desk';
      case 'ADMIN': return 'System Admin';
      default: return 'Staff Portal';
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div 
        className="auth-modal-box" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '460px', 
          padding: '32px 28px',
          borderRadius: '16px',
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.25)',
          background: '#FFFFFF'
        }}
      >
        <button 
          className="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          style={{ top: '20px', right: '20px' }}
        >
          ✕
        </button>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <BrandLogo size="medium" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '10px', letterSpacing: '-0.3px' }}>
            OmniStay <span style={{ color: 'var(--primary-azure)' }}>Resorts</span>
          </h2>
        </div>

        {/* 1. TOP PORTAL SLIDER TOGGLE (Guest Portal vs Staff & Admin Portal) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#F1F5F9',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '14px',
          position: 'relative'
        }}>
          <button
            type="button"
            style={{
              padding: '10px 14px',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              background: portalCategory === 'GUEST' ? '#FFFFFF' : 'transparent',
              color: portalCategory === 'GUEST' ? 'var(--primary-azure)' : '#64748B',
              boxShadow: portalCategory === 'GUEST' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
            onClick={() => {
              setPortalCategory('GUEST');
              fillDemoCredentials('GUEST');
            }}
          >
            🏨 Guest Sign In
          </button>

          <button
            type="button"
            style={{
              padding: '10px 14px',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              background: portalCategory === 'STAFF' ? '#FFFFFF' : 'transparent',
              color: portalCategory === 'STAFF' ? 'var(--primary-azure)' : '#64748B',
              boxShadow: portalCategory === 'STAFF' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
            onClick={() => {
              setPortalCategory('STAFF');
              fillDemoCredentials(staffRole);
            }}
          >
            🛡️ Staff & Admin
          </button>
        </div>

        {/* 2. SUB-DEPARTMENTS SLIDER PILLS (Only shown when STAFF is selected) */}
        {portalCategory === 'STAFF' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '4px', 
            background: '#F8FAFC', 
            padding: '4px', 
            borderRadius: '8px', 
            border: '1px solid #E2E8F0',
            marginBottom: '16px' 
          }}>
            <button
              type="button"
              style={{
                padding: '6px 2px',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: staffRole === 'STAFF_RESTAURANT' ? 'var(--primary-azure)' : 'transparent',
                color: staffRole === 'STAFF_RESTAURANT' ? '#FFFFFF' : '#64748B',
                textAlign: 'center'
              }}
              onClick={() => fillDemoCredentials('STAFF_RESTAURANT')}
            >
              🍽️ Restaurant
            </button>
            <button
              type="button"
              style={{
                padding: '6px 2px',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: staffRole === 'STAFF_HOUSEKEEPING' ? 'var(--primary-azure)' : 'transparent',
                color: staffRole === 'STAFF_HOUSEKEEPING' ? '#FFFFFF' : '#64748B',
                textAlign: 'center'
              }}
              onClick={() => fillDemoCredentials('STAFF_HOUSEKEEPING')}
            >
              🧹 Cleaning
            </button>
            <button
              type="button"
              style={{
                padding: '6px 2px',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: staffRole === 'STAFF_FRONTDESK' ? 'var(--primary-azure)' : 'transparent',
                color: staffRole === 'STAFF_FRONTDESK' ? '#FFFFFF' : '#64748B',
                textAlign: 'center'
              }}
              onClick={() => fillDemoCredentials('STAFF_FRONTDESK')}
            >
              🔑 Front Desk
            </button>
            <button
              type="button"
              style={{
                padding: '6px 2px',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: staffRole === 'ADMIN' ? 'var(--primary-azure)' : 'transparent',
                color: staffRole === 'ADMIN' ? '#FFFFFF' : '#64748B',
                textAlign: 'center'
              }}
              onClick={() => fillDemoCredentials('ADMIN')}
            >
              ⚡ Admin
            </button>
          </div>
        )}

        {/* Mode Switcher: Sign In vs Create Account */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              color: activeTab === 'SIGN_IN' ? 'var(--primary-azure)' : '#94A3B8',
              borderBottom: activeTab === 'SIGN_IN' ? '2px solid var(--primary-azure)' : 'none',
              paddingBottom: '4px'
            }}
            onClick={() => { setActiveTab('SIGN_IN'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              color: activeTab === 'SIGN_UP' ? 'var(--primary-azure)' : '#94A3B8',
              borderBottom: activeTab === 'SIGN_UP' ? '2px solid var(--primary-azure)' : 'none',
              paddingBottom: '4px'
            }}
            onClick={() => { setActiveTab('SIGN_UP'); setError(''); }}
          >
            Create New Account
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="auth-error-banner" style={{ marginBottom: '14px', borderRadius: '8px', fontSize: '0.8rem' }}>
            <span>{error}</span>
          </div>
        )}

        {/* ==================== TAB 1: SIGN IN ==================== */}
        {activeTab === 'SIGN_IN' && (
          <div>
            {/* Sub-Methods: Password vs OTP */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                className={`auth-mode-tab ${loginMethod === 'CREDENTIALS' ? 'active' : ''}`}
                style={{ flex: 1, padding: '6px', fontSize: '0.75rem', borderRadius: '6px' }}
                onClick={() => { setLoginMethod('CREDENTIALS'); setError(''); }}
              >
                Password Login
              </button>
              <button
                type="button"
                className={`auth-mode-tab ${loginMethod === 'MOBILE_OTP' ? 'active' : ''}`}
                style={{ flex: 1, padding: '6px', fontSize: '0.75rem', borderRadius: '6px' }}
                onClick={() => { setLoginMethod('MOBILE_OTP'); setError(''); }}
              >
                Mobile OTP
              </button>
            </div>

            {/* Credentials Form */}
            {loginMethod === 'CREDENTIALS' && (
              <form onSubmit={handleCredentialsLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Username or Mobile Number
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="form-input-custom" 
                    placeholder="Enter account username or phone"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Password
                  </label>
                  <input 
                    type="password" 
                    required 
                    className="form-input-custom" 
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary-azure" 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '6px', borderRadius: '8px' }}
                >
                  {isLoading ? 'Verifying Credentials...' : `Sign In to ${getRoleDisplayName()} →`}
                </button>
              </form>
            )}

            {/* Mobile OTP Form */}
            {loginMethod === 'MOBILE_OTP' && (
              <div>
                {!otpStep ? (
                  <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Mobile Phone Number
                      </label>
                      <input 
                        type="tel" 
                        required 
                        className="form-input-custom" 
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="btn-primary-azure" 
                      style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: '8px' }}
                    >
                      {isLoading ? 'Dispatching OTP...' : 'Send Verification OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#0369A1', textAlign: 'center', background: '#F0F9FF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #BAE6FD', fontWeight: 700 }}>
                      📱 6-Digit OTP Sent to <strong style={{ color: '#0F172A' }}>{phone}</strong>
                      <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                        Code: <strong style={{ background: '#0084FF', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', letterSpacing: '2px' }}>{activeOtpNotice?.otp || otpCode}</strong>
                      </div>
                    </div>

                    <div>
                      <input 
                        type="text" 
                        maxLength={6}
                        required 
                        className="form-input-custom" 
                        placeholder="123456"
                        style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 800, padding: '10px 14px', borderRadius: '8px' }}
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="btn-primary-azure" 
                      style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: '8px' }}
                    >
                      {isLoading ? 'Verifying...' : `Verify OTP & Access ${getRoleDisplayName()}`}
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setOtpStep(false)} 
                      style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700, textAlign: 'center' }}
                    >
                      ← Change Mobile Number
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: SIGN UP ==================== */}
        {activeTab === 'SIGN_UP' && (
          <form onSubmit={handleBackendSignup} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px', textTransform: 'uppercase' }}>Username *</label>
              <input type="text" required className="form-input-custom" placeholder="Choose a username" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} style={{ borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px', textTransform: 'uppercase' }}>Email Address *</label>
              <input type="email" required className="form-input-custom" placeholder="name@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} style={{ borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px', textTransform: 'uppercase' }}>Mobile Number *</label>
              <input type="tel" required className="form-input-custom" placeholder="9876543210" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} style={{ borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px', textTransform: 'uppercase' }}>Password *</label>
              <input type="password" required className="form-input-custom" placeholder="••••••••" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} style={{ borderRadius: '8px' }} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              <input 
                type="checkbox" 
                required
                checked={signupTermsAccepted}
                onChange={e => setSignupTermsAccepted(e.target.checked)}
                style={{ accentColor: 'var(--primary-azure)' }}
              />
              <span>I accept the <strong>Terms of Service</strong> & Privacy Policy.</span>
            </label>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary-azure" 
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '4px', borderRadius: '8px' }}
            >
              {isLoading ? 'Creating Account...' : `Register Account (${getRoleDisplayName()}) →`}
            </button>
          </form>
        )}

        {/* Modal Footer */}
        <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center' }}>
          🔒 Encrypted Spring Boot Microservice Authentication
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
