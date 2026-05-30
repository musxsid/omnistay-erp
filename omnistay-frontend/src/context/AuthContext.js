import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [viewMode, setViewMode] = useState('public');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setViewMode('public');
  };

  return (
    <AuthContext.Provider value={{ viewMode, setViewMode, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);