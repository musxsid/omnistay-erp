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
            onOpenAuth={() => setIsAuthOpen(true)}
            onBackToHome={() => setCurrentPage('LANDING')}
          />
        ) : (
          <GuestPortal onNavigateCatalog={() => setCurrentPage('CATALOG')} />
        )}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  // 3. Unauthenticated Visitors -> Landing Page or Dedicated Find & Reserve Page
  return (
    <>
      {currentPage === 'CATALOG' ? (
        <FindReservePage 
          onOpenAuth={() => setIsAuthOpen(true)}
          onBackToHome={() => setCurrentPage('LANDING')}
        />
      ) : (
        <LandingPage 
          onOpenAuth={() => setIsAuthOpen(true)}
          onNavigateCatalog={() => setCurrentPage('CATALOG')}
        />
      )}

      {/* Global Reusable Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
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