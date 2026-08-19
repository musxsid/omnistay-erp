import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import MetricCard from '../MetricCard';
import { apiFetch } from '../../services/apiClient';

const DashboardView = () => {
  const [metrics, setMetrics] = useState({
    totalRooms: 258,
    activeGuests: 142,
    occupiedRooms: 116,
    pendingInvoices: 24,
  });

  const [activeTab, setActiveTab] = useState('approval');

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const liveRooms = await apiFetch('/api/rooms/matrix').catch(() => []);
        if (liveRooms && liveRooms.length > 0) {
          const totalCount = liveRooms.length;
          const occupiedCount = liveRooms.filter(r => r.status === 'OCCUPIED').length;
          const activeGuestsCount = liveRooms.filter(r => r.guest || r.folioId).length;
          setMetrics(prev => ({
            ...prev,
            totalRooms: totalCount > 0 ? totalCount : 258,
            occupiedRooms: occupiedCount > 0 ? occupiedCount : 116,
            activeGuests: activeGuestsCount > 0 ? activeGuestsCount : 142
          }));
        }
      } catch (err) {
        console.error("Error fetching live metrics:", err);
      }
    };
    fetchDashboardMetrics();
  }, []);

  const donutData = [
    { name: 'Maintenance', value: 45, color: '#0084FF' },
    { name: 'Capital', value: 30, color: '#475569' },
    { name: 'Others', value: 25, color: '#94A3B8' },
  ];

  const revenueData = [
    { day: 'Mon', revenue: 4200 },
    { day: 'Tue', revenue: 6800 },
    { day: 'Wed', revenue: 9500 },
    { day: 'Thu', revenue: 8100 },
    { day: 'Fri', revenue: 14200 },
    { day: 'Sat', revenue: 18500 },
    { day: 'Sun', revenue: 16000 },
  ];

  const tasksData = [
    { id: 1, name: 'HVAC Air Filter Replacement - Executive Suite 101', code: '10000000105', category: 'Maintenance', status: 'Pending', action: 'Prepare Estimate' },
    { id: 2, name: 'Main Lobby Marble Polishing & Lighting Update', code: '10000000106', category: 'Capital', status: 'Approved', action: 'Modify Estimate' },
    { id: 3, name: 'Poolside Restaurant Bar Stool Upholstery', code: '10000000107', category: 'Others', status: 'In Progress', action: 'Prepare Estimate' },
    { id: 4, name: 'Presidential Suite Balcony Waterproofing', code: '10000000108', category: 'Maintenance', status: 'Pending', action: 'View Details' },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Header Greeting Banner */}
      <div className="page-header-row" style={{ marginBottom: '24px' }}>
        <div className="greeting-text">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>Hello, Siddharth Kumar</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>General Manager & Operations Lead</p>
        </div>
      </div>

      {/* Top Stat Widgets Grid */}
      <div className="dashboard-stats-grid">
        <MetricCard 
          code="WO" 
          title="Total Work Orders" 
          value={metrics.totalRooms} 
          trend="+2.7% vs prev week" 
          trendType="up" 
        />
        <MetricCard 
          code="EW" 
          title="Estimated Works" 
          value={metrics.activeGuests} 
          trend="20% completed" 
          trendType="down" 
        />
        <MetricCard 
          code="AW" 
          title="Approved Works" 
          value={metrics.occupiedRooms} 
          trend="35% approved" 
          trendType="up" 
        />
        <MetricCard 
          code="PI" 
          title="Pending Invoices" 
          value={metrics.pendingInvoices} 
          trend="4 needs review" 
          trendType="down" 
        />
      </div>

      {/* Charts Grid: Donut Chart + Revenue Chart */}
      <div className="charts-split-grid">
        {/* Weekly Revenue Gradient Area Chart */}
        <div className="white-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Revenue & Operations Overview</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>THIS WEEK</span>
          </div>
          <div style={{ height: 240, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="azureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0084FF" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0084FF" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0px' }} 
                  formatter={(val) => [`$${val}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0084FF" strokeWidth={2.5} fillOpacity={1} fill="url(#azureGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="white-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>Work Category</h3>
          <div style={{ height: 180, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
            {donutData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                <span style={{ width: '8px', height: '8px', background: item.color, display: 'inline-block' }}></span>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={activeTab === 'approval' ? 'btn-primary-azure' : 'btn-outline-pill'}
              style={{ fontSize: '0.78rem', padding: '8px 16px' }}
              onClick={() => setActiveTab('approval')}
            >
              Approval List (126)
            </button>
            <button 
              className={activeTab === 'new' ? 'btn-primary-azure' : 'btn-outline-pill'}
              style={{ fontSize: '0.78rem', padding: '8px 16px' }}
              onClick={() => setActiveTab('new')}
            >
              New Work Orders (42)
            </button>
            <button 
              className={activeTab === 'estimates' ? 'btn-primary-azure' : 'btn-outline-pill'}
              style={{ fontSize: '0.78rem', padding: '8px 16px' }}
              onClick={() => setActiveTab('estimates')}
            >
              Estimates (07)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select className="form-select-custom" style={{ width: '160px', padding: '6px 12px' }}>
              <option value="all">All Categories</option>
              <option value="maint">Maintenance</option>
              <option value="cap">Capital</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="modern-table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th>Sl No.</th>
                <th>Name of Work</th>
                <th>Work Code</th>
                <th>Work Category</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasksData.map((task) => (
                <tr key={task.id}>
                  <td><input type="checkbox" /></td>
                  <td style={{ fontWeight: 800 }}>{task.id}</td>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{task.name}</td>
                  <td style={{ color: '#64748B', fontWeight: 600 }}>{task.code}</td>
                  <td style={{ fontWeight: 600 }}>{task.category}</td>
                  <td>
                    <span className={`status-pill ${task.status.toLowerCase().replace(' ', '')}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-outline-pill" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                      {task.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;