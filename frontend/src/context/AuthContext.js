import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // ADMIN, STAFF_FRONTDESK, STAFF_HOUSEKEEPING, STAFF_RESTAURANT, GUEST
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [currentUserAccount, setCurrentUserAccount] = useState(null);
  const [keycloakSynced, setKeycloakSynced] = useState(false);

  // Fetch fresh user profile directly from PostgreSQL DB
  const fetchFreshUserProfile = async (identifier) => {
    if (!identifier) return null;
    const endpoints = [
      `http://localhost:8000/api/v1/auth/user/${encodeURIComponent(identifier)}`,
      `http://localhost:8081/api/v1/auth/user/${encodeURIComponent(identifier)}`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.userAccount) {
            return data.userAccount;
          }
        }
      } catch (e) {
        // Continue to fallback endpoint
      }
    }
    return null;
  };

  useEffect(() => {
    const storedAuth = localStorage.getItem('omnistay_auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setIsAuthenticated(parsed.isAuthenticated);
        setUserRole(parsed.userRole);
        setUserEmail(parsed.userEmail || '');
        setUserPhone(parsed.userPhone || '');
        setKeycloakSynced(parsed.keycloakSynced || false);
        const storedAcc = parsed.userAccount || null;
        setCurrentUserAccount(storedAcc);

        // Fetch latest state directly from PostgreSQL DB to ensure 100% sync
        const lookupId = storedAcc?.accountId || storedAcc?.username || parsed.userEmail || parsed.userPhone;
        if (lookupId) {
          fetchFreshUserProfile(lookupId).then(freshAcc => {
            if (freshAcc) {
              setCurrentUserAccount(freshAcc);
              setUserEmail(freshAcc.email || '');
              setUserPhone(freshAcc.phone || '');
              localStorage.setItem('omnistay_auth', JSON.stringify({
                ...parsed,
                userAccount: freshAcc,
                userEmail: freshAcc.email || '',
                userPhone: freshAcc.phone || ''
              }));
            }
          });
        }
      } catch (e) {
        console.error("Auth parsing error:", e);
      }
    }
  }, []);

  const saveAuthSession = (session) => {
    const acc = session.userAccount || null;
    setIsAuthenticated(session.isAuthenticated);
    setUserRole(session.userRole);
    setUserEmail(acc?.email || session.userEmail || '');
    setUserPhone(acc?.phone || session.userPhone || '');
    setKeycloakSynced(session.keycloakSynced || false);
    setCurrentUserAccount(acc);
    localStorage.setItem('omnistay_auth', JSON.stringify({
      ...session,
      userEmail: acc?.email || session.userEmail || '',
      userPhone: acc?.phone || session.userPhone || ''
    }));
  };

  // Update user profile directly in PostgreSQL DB
  const updateUserProfile = async (updatedFields) => {
    if (!currentUserAccount) return;
    const lookupId = currentUserAccount.accountId || currentUserAccount.username;

    const payload = {
      accountId: currentUserAccount.accountId,
      username: currentUserAccount.username,
      ...updatedFields
    };

    const endpoints = [
      'http://localhost:8000/api/v1/auth/profile',
      'http://localhost:8081/api/v1/auth/profile'
    ];

    let updatedFromDb = null;
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.userAccount) {
            updatedFromDb = data.userAccount;
            break;
          }
        }
      } catch (e) {
        // Try next endpoint
      }
    }

    const finalAccount = updatedFromDb || { ...currentUserAccount, ...updatedFields };
    setCurrentUserAccount(finalAccount);
    if (finalAccount.email) setUserEmail(finalAccount.email);
    if (finalAccount.phone) setUserPhone(finalAccount.phone);

    const storedAuth = localStorage.getItem('omnistay_auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        parsed.userAccount = finalAccount;
        parsed.userEmail = finalAccount.email || parsed.userEmail;
        parsed.userPhone = finalAccount.phone || parsed.userPhone;
        localStorage.setItem('omnistay_auth', JSON.stringify(parsed));
      } catch (e) {}
    }
  };

  // Backend Microservice Login (Authenticates against PostgreSQL DB)
  const authenticateByCredentials = async (identifier, password, targetRole = '') => {
    if (!identifier) return { success: false, message: 'Please enter your Username, Email, or Mobile Number.' };

    const cleanId = identifier.trim();

    const endpoints = [
      'http://localhost:8000/api/v1/auth/login',
      'http://localhost:8081/api/v1/auth/login'
    ];

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: cleanId, password, targetRole }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json().catch(() => null);

        if (response.ok && data && data.success) {
          const account = data.userAccount;
          const session = {
            isAuthenticated: true,
            userRole: account.role || targetRole || 'GUEST',
            userEmail: account.email || cleanId,
            userPhone: account.phone || '',
            userAccount: account,
            keycloakSynced: true
          };
          saveAuthSession(session);
          return { success: true, role: account.role || targetRole || 'GUEST', account };
        } else if (data && data.message) {
          return { success: false, message: data.message };
        }
      } catch (e) {
        // Try next endpoint if offline
      }
    }

    return { success: false, message: 'Authentication failed. Please check your credentials.' };
  };

  const [activeOtpStore, setActiveOtpStore] = useState({});

  // Dispatch SMS OTP to Mobile Number
  const sendMobileOTP = async (phone) => {
    if (!phone || phone.length < 7) {
      return { success: false, message: 'Please enter a valid mobile phone number.' };
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActiveOtpStore(prev => ({ ...prev, [phone]: data.otp }));
          return data;
        }
      }
    } catch (e) {}

    const localOtp = String(Math.floor(100000 + Math.random() * 900000));
    setActiveOtpStore(prev => ({ ...prev, [phone]: localOtp }));
    return { success: true, otp: localOtp, message: 'Local OTP Challenge Generated' };
  };

  // Verify Mobile OTP Code
  const verifyMobileOTP = async (phone, otp, targetRole = '') => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, targetRole })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const account = data.userAccount;
          const session = {
            isAuthenticated: true,
            userRole: account.role || targetRole || 'GUEST',
            userEmail: account.email || `${phone}@omnistay.com`,
            userPhone: phone,
            userAccount: account,
            keycloakSynced: true
          };
          saveAuthSession(session);
          return { success: true, isNew: data.isNewAccount, role: account.role || targetRole || 'GUEST', account };
        } else {
          return { success: false, message: data.message };
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.message || 'OTP Verification failed.' };
      }
    } catch (e) {}

    return { success: false, message: 'Verification service unavailable. Please try again.' };
  };

  // Backend Registration Microservice (Saves directly to PostgreSQL DB)
  const registerBackendUser = async (payload) => {
    const endpoints = [
      'http://localhost:8000/api/v1/auth/signup',
      'http://localhost:8081/api/v1/auth/signup'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data && data.success) {
          const account = data.userAccount;
          const session = {
            isAuthenticated: true,
            userRole: account.role || payload.role || 'GUEST',
            userEmail: account.email || payload.email,
            userPhone: account.phone || payload.phone,
            userAccount: account,
            keycloakSynced: true
          };
          saveAuthSession(session);
          return { success: true, account };
        } else if (data && data.message) {
          return { success: false, message: data.message };
        }
      } catch (e) {
        // Try next endpoint
      }
    }

    return { success: false, message: 'Registration service unavailable. Please try again.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail('');
    setUserPhone('');
    setCurrentUserAccount(null);
    localStorage.removeItem('omnistay_auth');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userRole,
      userEmail,
      userPhone,
      currentUserAccount,
      keycloakSynced,
      authenticateByCredentials,
      sendMobileOTP,
      verifyMobileOTP,
      registerBackendUser,
      updateUserProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);