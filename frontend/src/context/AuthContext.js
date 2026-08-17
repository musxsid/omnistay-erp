import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState('internal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('isAuth') === 'true');
    setViewMode(localStorage.getItem('viewMode') || 'internal');
    setLoading(false);
  }, []);

  const login = (u, p) => {
    if (u === 'admin' && p === 'admin123') {
      setIsAuthenticated(true);
      setViewMode('internal');
      localStorage.setItem('isAuth', 'true');
      localStorage.setItem('viewMode', 'internal');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setViewMode('internal');
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, viewMode, setViewMode, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);