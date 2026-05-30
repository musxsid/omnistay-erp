import React from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import GuestPortal from './pages/GuestPortal';
import LoginGateway from './pages/LoginGateway';
import EnterpriseLayout from './components/layout/EnterpriseLayout';

import './assets/styles/apple-theme.css';


function MainRouter() {
  const { viewMode, isAuthenticated } = useAuth();

  if (viewMode === 'public') return <GuestPortal />;
  
  if (viewMode === 'internal' && !isAuthenticated) return <LoginGateway />;

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