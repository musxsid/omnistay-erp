import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Sidebar from '../Sidebar';
import DashboardView from './DashboardView'; 
import PosScreen from '../PosScreen'; 
import RoomMatrix from '../RoomMatrix';
import AiConcierge from '../../pages/AiConcierge';
import AdminDashboard from '../../pages/AdminDashboard'; 
import BookingsDashboard from '../../pages/BookingsDashboard';
import CustomModal from '../CustomModal';

const EnterpriseLayout = () => {
  const { logout, userRole } = useAuth();
  const { fetchEnterpriseData, properties, selectedPropertyId, setSelectedPropertyId } = useData();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Sign out confirmation modal state
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  useEffect(() => {
    if (userRole === 'STAFF_RESTAURANT') {
      setActiveTab('pos');
    } else if (userRole === 'STAFF_HOUSEKEEPING') {
      setActiveTab('housekeeping');
    } else if (userRole === 'STAFF_FRONTDESK') {
      setActiveTab('rooms');
    } else if (userRole === 'ADMIN') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('dashboard');
    }
  }, [userRole]);

  return (
    <div className="enterprise-layout">
      {/* Sidebar Component */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="content-area">
        {/* Top Header */}
        <header className="top-header">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              className="search-bar-input" 
              placeholder="Search works, rooms, guests, folios..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="header-right-actions">
            {/* Multi-Property Switcher Badge */}
            <select
              className="header-badge-btn active-property"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              style={{ border: '1px solid var(--border-subtle)', outline: 'none', background: 'var(--bg-app)', fontWeight: 800 }}
            >
              <option value="00000000-0000-0000-0000-000000000001">Vargarammoota Grand Resort</option>
              <option value="00000000-0000-0000-0000-000000000002">Aman Ocean Residence</option>
              <option value="00000000-0000-0000-0000-000000000003">St. Moritz Alpine Chalet</option>
            </select>

            {/* RevPAR & ADR Badges */}
            <div className="header-badge-btn" style={{ background: 'var(--primary-azure-light)', color: 'var(--primary-azure)', borderColor: 'var(--primary-azure)', fontWeight: 800 }}>
              ADR: $420 • RevPAR: $368
            </div>

            {/* Sync Live Data */}
            <button className="btn-outline-pill" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={fetchEnterpriseData} title="Sync Live Data">
              Sync Data
            </button>

            {/* Sign Out with Confirmation Modal */}
            <button 
              className="btn-outline-pill" 
              onClick={() => setIsSignOutModalOpen(true)} 
              style={{ color: 'var(--text-main)', borderColor: 'var(--border-subtle)' }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Content View Container */}
        <div className="main-scroll">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'rooms' && <RoomMatrix forcedMode="FRONT_DESK" globalSearch={searchTerm} />}
          {activeTab === 'housekeeping' && <RoomMatrix forcedMode="HOUSEKEEPING" globalSearch={searchTerm} />}
          {activeTab === 'bookings' && <BookingsDashboard globalSearch={searchTerm} />}
          {activeTab === 'admin' && <AdminDashboard />}
          {activeTab === 'ai' && <AiConcierge />}
          {activeTab === 'pos' && <PosScreen />}
        </div>
      </main>

      {/* Custom Theme-Matching Sign Out Confirmation Modal */}
      <CustomModal 
        isOpen={isSignOutModalOpen}
        type="CONFIRM"
        title="Confirm Operational Sign Out"
        message="Are you sure you want to sign out of the OmniStay ERP Enterprise System?"
        confirmText="Sign Out Now"
        cancelText="Cancel"
        onConfirm={() => logout()}
        onClose={() => setIsSignOutModalOpen(false)}
      />
    </div>
  );
};

export default EnterpriseLayout;