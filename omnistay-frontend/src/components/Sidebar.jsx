import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => (
  <aside className="sidebar">
    <div className="sidebar-brand">
      <div className="brand-text">OmniStay</div>
    </div>
    <nav className="sidebar-nav">
      <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Overview Metrics</button>
      <button className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>Room Management</button>
      <button className={activeTab === 'pos' ? 'active' : ''} onClick={() => setActiveTab('pos')}>Restaurant POS</button>
      
      {/* NEW: Admin Panel Navigation Button */}
      <button className={activeTab === 'admin' ? 'active' : ''} onClick={() => setActiveTab('admin')}>Admin Settings</button>
      
      {/* NEW: AI Concierge Navigation Button */}
      <button 
        className={activeTab === 'ai' ? 'active' : ''} 
        onClick={() => setActiveTab('ai')}
        style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}
      >
        ✨ AI Concierge
      </button>
      <button 
  className={`nav-item ${currentView === 'bookings' ? 'active' : ''}`}
  onClick={() => setViewMode('bookings')} // Or whichever state handler changes your main view area
>
  <span>📅</span> Bookings Log
</button>
    </nav>
  </aside>
);

export default Sidebar;