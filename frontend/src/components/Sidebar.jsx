import React from 'react';
import BrandLogo from './BrandLogo';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { userRole, userEmail, userPhone } = useAuth();

  const getNavItems = () => {
    if (userRole === 'STAFF_FRONTDESK') {
      return [
        { id: 'dashboard', label: 'Works Overview' },
        { id: 'rooms', label: 'Front Desk & Matrix' },
        { id: 'bookings', label: 'Bookings Log' }
      ];
    }
    if (userRole === 'STAFF_HOUSEKEEPING') {
      return [
        { id: 'dashboard', label: 'Works Overview' },
        { id: 'rooms', label: 'Cleaning Matrix & Housekeeping' }
      ];
    }
    if (userRole === 'STAFF_RESTAURANT') {
      return [
        { id: 'pos', label: 'Restaurant POS & Folio' }
      ];
    }
    // ADMIN
    return [
      { id: 'dashboard', label: 'Works Overview' },
      { id: 'rooms', label: 'Room Matrix' },
      { id: 'pos', label: 'Restaurant POS' },
      { id: 'bookings', label: 'Bookings Log' }
    ];
  };

  const getAdminItems = () => {
    if (userRole === 'ADMIN') {
      return [
        { id: 'admin', label: 'System Admin' },
        { id: 'ai', label: 'AI Concierge' }
      ];
    }
    return [];
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case 'STAFF_FRONTDESK': return 'Front Desk Lead';
      case 'STAFF_HOUSEKEEPING': return 'Housekeeping Executive';
      case 'STAFF_RESTAURANT': return 'F&B Restaurant Manager';
      default: return 'General Manager (Admin)';
    }
  };

  const navItems = getNavItems();
  const adminItems = getAdminItems();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div>
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-light)', marginBottom: '20px' }}>
          <BrandLogo subtitle="ENTERPRISE ERP" size="small" />
        </div>

        {/* Primary Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-heading">Operational Realm</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.label}</span>
            </button>
          ))}

          {adminItems.length > 0 && (
            <>
              <div className="sidebar-heading" style={{ marginTop: '20px' }}>Management & AI</div>
              {adminItems.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item-btn ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </>
          )}
        </nav>
      </div>

      {/* User Profile Badge */}
      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="avatar-circle">
            {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'SK'}
          </div>
          <div className="user-info">
            <span className="user-name" style={{ fontSize: '0.78rem' }}>{userEmail || userPhone || 'Staff User'}</span>
            <span className="user-role" style={{ fontSize: '0.7rem' }}>{getRoleTitle()}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;