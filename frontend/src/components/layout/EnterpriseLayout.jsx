import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import DashboardView from './DashboardView'; 
import PosScreen from '../PosScreen'; 
import RoomMatrix from '../RoomMatrix';
import AiConcierge from '../../pages/AiConcierge';
import AdminDashboard from '../../pages/AdminDashboard'; 
import BookingsDashboard from '../../pages/BookingsDashboard'; // NEW: Import Bookings Dashboard Module

const EnterpriseLayout = () => {
  const { logout } = useAuth();
  const { fetchEnterpriseData } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="enterprise-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
            <div className="brand-icon">◱</div>
            <div className="brand-text">OmniStay ERP</div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-heading">Operations</div>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Command Center</button>
          
          <button className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>Room Matrix</button>
          
          <button className={activeTab === 'pos' ? 'active' : ''} onClick={() => setActiveTab('pos')}>Restaurant POS</button>

          {/* NEW: Bookings Log Sidebar Navigation Option */}
          <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>📅 Bookings Log</button>

          <button className={activeTab === 'admin' ? 'active' : ''} onClick={() => setActiveTab('admin')}>Admin Settings</button>
          
          <button 
            className={activeTab === 'ai' ? 'active' : ''} 
            onClick={() => setActiveTab('ai')}
            style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}
          >
            ✨ AI Concierge
          </button>
        </nav>
      </aside>

      <main className="content-area">
        <header className="top-header">
          <input type="text" className="search-bar" placeholder="Search parameters..." />
          <div className="profile-section">
            <button className="apple-btn secondary" onClick={fetchEnterpriseData}>Sync Database</button>
            <button className="apple-btn text-only" onClick={logout} style={{color: '#ef4444'}}>End Session</button>
          </div>
        </header>

        <div className="main-scroll">
          {activeTab === 'dashboard' && <DashboardView />}
          
          {activeTab === 'rooms' && <RoomMatrix />}

          {/* NEW: Render Route Condition for Active Bookings View Layout */}
          {activeTab === 'bookings' && <BookingsDashboard />}

          {activeTab === 'admin' && <AdminDashboard />}
          
          {activeTab === 'ai' && <AiConcierge />}
          
          {activeTab === 'pos' && (
            <div style={{width: '100%', maxWidth: '1000px'}}>
              <div className="page-title">
                <h2>Point of Sale</h2>
                <p>Restaurant and amenities billing.</p>
              </div>
              <PosScreen />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EnterpriseLayout;