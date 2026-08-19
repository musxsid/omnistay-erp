import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import LandingPage from './pages/LandingPage';
import FindReservePage from './pages/FindReservePage';
import GuestPortal from './pages/GuestPortal';
import EnterpriseLayout from './components/layout/EnterpriseLayout';
import AuthModal from './components/AuthModal';

import './assets/styles/enterprise-theme.css';

function MainRouter() {
  const { isAuthenticated, userRole } = useAuth();
  const [currentPage, setCurrentPage] = useState('LANDING'); // LANDING, CATALOG
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [defaultAuthRole, setDefaultAuthRole] = useState('GUEST');

  const handleOpenAuth = (role = 'GUEST') => {
    setDefaultAuthRole(role);
    setIsAuthOpen(true);
  };

  // 1. Authenticated Staff Users (Admin, Front Desk, Housekeeping, Restaurant POS)
  if (isAuthenticated && userRole && userRole !== 'GUEST') {
    return <EnterpriseLayout />;
  }

  // 2. Authenticated Guest Users -> Guest Hub & Folio Account
  if (isAuthenticated && userRole === 'GUEST') {
    return (
      <>
        {currentPage === 'CATALOG' ? (
          <FindReservePage 
            onOpenAuth={handleOpenAuth}
            onBackToHome={() => setCurrentPage('LANDING')}
          />
        ) : (
          <GuestPortal 
            onNavigateCatalog={() => setCurrentPage('CATALOG')}
            onOpenAuthModal={handleOpenAuth}
          />
        )}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultRole={defaultAuthRole} />
      </>
    );
  }

  // 3. Unauthenticated Visitors -> Landing Page or Dedicated Find & Reserve Page
  return (
    <>
      {currentPage === 'CATALOG' ? (
        <FindReservePage 
          onOpenAuth={handleOpenAuth}
          onBackToHome={() => setCurrentPage('LANDING')}
        />
      ) : (
        <LandingPage 
          onOpenAuth={handleOpenAuth}
          onNavigateCatalog={() => setCurrentPage('CATALOG')}
        />
      )}

      {/* Global Reusable Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        defaultRole={defaultAuthRole}
      />
    </>
  );
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