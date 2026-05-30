import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EnterpriseLayout = () => {
  const { logout } = useAuth();
  const { metrics, rooms, guests, syncTelemetryMetrics } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');

  const pieColors = ['#000000', '#86868b', '#ff3b30', '#ff9500'];
  const getRoomPieData = () => [
    { name: 'Available', value: rooms.filter(r => r.status === 'AVAILABLE').length },
    { name: 'Occupied', value: rooms.filter(r => r.status === 'OCCUPIED').length },
    { name: 'Dirty', value: rooms.filter(r => r.status === 'DIRTY').length },
    { name: 'Maintenance', value: rooms.filter(r => r.status === 'MAINTENANCE').length }
  ];

  const getTelemetryLineData = () => Object.entries(metrics.routes).map(([route, hits]) => ({
    name: route.split(' ')[0] + ' ' + route.split('/').pop(),
    hits: hits
  }));

  return (
    <div className="enterprise-layout">
      <aside className="sidebar">
        <div className="sidebar-header">OmniStay ERP</div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>Rooms</button>
          <button className={activeTab === 'guests' ? 'active' : ''} onClick={() => setActiveTab('guests')}>Guests</button>
          <button className={activeTab === 'billing' ? 'active' : ''} onClick={() => setActiveTab('billing')}>Billing</button>
        </nav>
        <button className="apple-btn text-only logout" onClick={logout}>Sign Out</button>
      </aside>

      <main className="content-area">
        <header className="content-header">
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <button className="apple-btn secondary" onClick={syncTelemetryMetrics}>Sync Data</button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <div className="metrics-row">
              <div className="apple-card metric">
                <span className="label">Total API Requests</span>
                <span className="value">{metrics.totalCount}</span>
              </div>
              <div className="apple-card metric">
                <span className="label">Active Integrations</span>
                <span className="value">{metrics.integrations}</span>
              </div>
              <div className="apple-card metric">
                <span className="label">Gross Revenue</span>
                <span className="value">${(metrics.grossRevenue / 100).toLocaleString()}</span>
              </div>
            </div>

            <div className="charts-row">
              <div className="apple-card chart">
                <h3>Traffic Curve</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={getTelemetryLineData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5ea"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#86868b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#86868b'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="hits" stroke="#000000" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="apple-card chart">
                <h3>Room Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={getRoomPieData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                      {getRoomPieData().map((e, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="apple-card table-card">
            <table className="apple-table">
              <thead><tr><th>UUID</th><th>Room</th><th>Rate</th><th>Status</th></tr></thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.roomId}>
                    <td className="text-muted">{r.roomId.substring(0,8)}...</td>
                    <td>{r.roomNumber} ({r.roomType})</td>
                    <td>${r.dailyRate}</td>
                    <td><span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'guests' && (
          <div className="apple-card table-card">
            <table className="apple-table">
              <thead><tr><th>Guest Name</th><th>Contact</th><th>Address</th></tr></thead>
              <tbody>
                {guests.map(g => (
                  <tr key={g.guestId}>
                    <td><strong>{g.fullName}</strong></td>
                    <td>{g.phone}<br/><span className="text-muted">{g.email}</span></td>
                    <td>{g.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="apple-card table-card">
            <table className="apple-table">
              <thead><tr><th>Invoice ID</th><th>Guest Name</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>INV-0501</td><td>Aaron Sharma</td><td>$1,200.00</td><td><span className="status-badge available">Paid</span></td></tr>
                <tr><td>INV-0502</td><td>Aditi Patel</td><td>$750.00</td><td><span className="status-badge dirty">Pending</span></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default EnterpriseLayout;