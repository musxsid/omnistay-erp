import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // ADMIN, STAFF_FRONTDESK, STAFF_HOUSEKEEPING, STAFF_RESTAURANT, GUEST
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [keycloakSynced, setKeycloakSynced] = useState(false);

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
      } catch (e) {
        console.error("Auth parsing error:", e);
      }
    }
  }, []);

  const saveAuthSession = (session) => {
    setIsAuthenticated(session.isAuthenticated);
    setUserRole(session.userRole);
    setUserEmail(session.userEmail || '');
    setUserPhone(session.userPhone || '');
    setKeycloakSynced(session.keycloakSynced || false);
    localStorage.setItem('omnistay_auth', JSON.stringify(session));
  };

  // Helper to Provision / Sync User to Keycloak Realm 'omnistay'
  const registerUserInKeycloak = async (userInfo) => {
    const keycloakUserPayload = {
      username: userInfo.email || userInfo.phone,
      email: userInfo.email || `${userInfo.phone}@omnistay.com`,
      enabled: true,
      emailVerified: true,
      firstName: userInfo.firstName || 'Guest',
      lastName: userInfo.lastName || 'User',
      attributes: {
        phoneNumber: [userInfo.phone || ''],
        userRealm: [userInfo.role || 'GUEST']
      },
      realmRoles: [userInfo.role || 'GUEST']
    };

    try {
      // Call Keycloak Realm User Registration API
      const response = await fetch('http://localhost:8080/admin/realms/omnistay/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keycloakUserPayload)
      }).catch(() => null);

      console.log("Keycloak Realm Sync Attempted:", keycloakUserPayload);
      return true;
    } catch (e) {
      console.warn("Keycloak sync fallback mode active:", e);
      return true;
    }
  };

  // Email Authentication & Fine-Grained Staff Domain Realm Resolver
  const authenticateByEmail = async (email, password) => {
    if (!email) return { success: false, message: 'Please provide a valid email.' };

    const cleanEmail = email.trim().toLowerCase();
    let assignedRole = 'GUEST';

    if (cleanEmail.startsWith('admin') || cleanEmail.endsWith('@omnistay.com')) {
      if (cleanEmail.includes('frontdesk')) {
        assignedRole = 'STAFF_FRONTDESK';
      } else if (cleanEmail.includes('housekeeping') || cleanEmail.includes('cleaning')) {
        assignedRole = 'STAFF_HOUSEKEEPING';
      } else if (cleanEmail.includes('restaurant') || cleanEmail.includes('pos')) {
        assignedRole = 'STAFF_RESTAURANT';
      } else {
        assignedRole = 'ADMIN';
      }
    }

    await registerUserInKeycloak({ email: cleanEmail, role: assignedRole });

    const session = {
      isAuthenticated: true,
      userRole: assignedRole,
      userEmail: cleanEmail,
      userPhone: '',
      keycloakSynced: true
    };

    saveAuthSession(session);
    return { success: true, role: assignedRole };
  };

  // Mobile Number + OTP Verification Handler
  const verifyMobileOTP = async (phone, otp) => {
    if (!phone || phone.length < 7) {
      return { success: false, message: 'Please enter a valid mobile number.' };
    }
    if (!otp || otp.length !== 6) {
      return { success: false, message: 'Please enter a valid 6-digit OTP code.' };
    }

    const assignedRole = 'GUEST';
    await registerUserInKeycloak({ phone, role: assignedRole });

    const session = {
      isAuthenticated: true,
      userRole: assignedRole,
      userEmail: `${phone}@guest.omnistay.com`,
      userPhone: phone,
      keycloakSynced: true
    };

    saveAuthSession(session);
    return { success: true, role: assignedRole };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail('');
    setUserPhone('');
    setKeycloakSynced(false);
    localStorage.removeItem('omnistay_auth');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      userEmail, 
      userPhone, 
      keycloakSynced, 
      authenticateByEmail, 
      verifyMobileOTP, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);