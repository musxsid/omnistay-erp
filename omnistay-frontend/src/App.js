import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import GuestPortal from './pages/GuestPortal';
import LoginGateway from './pages/LoginGateway';
import EnterpriseLayout from './components/layout/EnterpriseLayout';

import './assets/styles/enterprise-theme.css';

function MainRouter() {
  const { viewMode, isAuthenticated } = useAuth();

  // 1. If public, show the guest portal
  if (viewMode === 'public') return <GuestPortal />;
  
  // 2. Default entry point is the login screen
  if (!isAuthenticated) return <LoginGateway />;

  // 3. Authenticated staff
  return <EnterpriseLayout />;
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainRouter />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;