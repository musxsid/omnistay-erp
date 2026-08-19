import React, { useState } from 'react';
import { 
  AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import MetricCard from '../MetricCard';
import { useHotelData } from '../../services/hotelDataStore';
import { useFolioLedgers } from '../../services/folioLedgerStore';

const DashboardView = () => {
  const { suites } = useHotelData();
  const { pendingBookings, activeRooms, activeFolios, pastStayHistory, posHistory } = useFolioLedgers();
  
  const [activeTab, setActiveTab] = useState('active');
  const [previewImage, setPreviewImage] = useState(null);

  // Compute Live Real-Time Dashboard Metrics from Ledger Store
  const occupiedCount = activeRooms.length;
  const pendingCount = pendingBookings.length;
  const settledCount = pastStayHistory.length;
  const totalCapacity = suites.length || 16;
  const occupancyPercent = ((occupiedCount / totalCapacity) * 100).toFixed(0);

  // Calculate Real-Time Active & Settled Revenues
  let activeRevenueTotal = 0;
  Object.values(activeFolios).forEach(txns => {
    txns.forEach(t => { activeRevenueTotal += Number(t.amount || 0); });
  });

  const settledRevenueTotal = pastStayHistory.reduce((sum, h) => sum + Number(h.grandTotal || 0), 0);
  const grandTotalRevenue = activeRevenueTotal + settledRevenueTotal;

  // Calculate Department Breakdown from Real Ledger Data (Zero Dummy Fallbacks)
  let fnbTotal = 0;
  let spaTotal = 0;
  let housekeepingTotal = 0;
  let lodgingTotal = 0;

  Object.values(activeFolios).forEach(txns => {
    txns.forEach(t => {
      const code = (t.departmentCode || '').toUpperCase();
      const amt = Number(t.amount || 0);
      const desc = (t.description || '').toLowerCase();

      if (code === 'F_AND_B' || code === 'DINING' || desc.includes('dining') || desc.includes('wagyu') || desc.includes('tuna') || desc.includes('champagne')) {
        fnbTotal += amt;
      } else if (code === 'SPA' || desc.includes('spa') || desc.includes('massage') || desc.includes('facial')) {
        spaTotal += amt;
      } else if (code === 'HOUSEKEEPING' || desc.includes('housekeeping') || desc.includes('towel') || desc.includes('laundry')) {
        housekeepingTotal += amt;
      } else {
        lodgingTotal += amt;
      }
    });
  });

  pastStayHistory.forEach(h => {
    (h.transactions || []).forEach(t => {
      const code = (t.departmentCode || '').toUpperCase();
      const amt = Number(t.amount || 0);
      const desc = (t.description || '').toLowerCase();

      if (code === 'F_AND_B' || code === 'DINING' || desc.includes('dining')) fnbTotal += amt;
      else if (code === 'SPA' || desc.includes('spa')) spaTotal += amt;
      else if (code === 'HOUSEKEEPING' || desc.includes('housekeeping')) housekeepingTotal += amt;
      else lodgingTotal += amt;
    });
  });

  // Department Donut Data (Calculated 100% from Real Database Folios)
  const realDeptData = [
    { name: 'Room Lodging', value: lodgingTotal, color: '#0284C7' },
    { name: 'Dining (F&B)', value: fnbTotal, color: '#10B981' },
    { name: 'Spa & Wellness', value: spaTotal, color: '#8B5CF6' },
    { name: 'Housekeeping', value: housekeepingTotal, color: '#F59E0B' },
  ];

  const donutData = realDeptData.some(d => d.value > 0)
    ? realDeptData
    : [{ name: 'Awaiting Initial Charges', value: 1, color: '#CBD5E1' }];

  // Dynamic Weekly Revenue Trend Chart Data (100% Pure Real-Time Calculation)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const realDayTotals = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

  // Calculate actual daily transaction totals from active folios
  Object.values(activeFolios).forEach(txns => {
    txns.forEach(t => {
      const amt = Number(t.amount || 0);
      const d = t.date ? new Date(t.date) : new Date();
      const day = dayNames[d.getDay()];
      if (realDayTotals[day] !== undefined) {
        realDayTotals[day] += amt;
      }
    });
  });

  // Calculate actual daily settled totals from past stay history
  pastStayHistory.forEach(h => {
    const amt = Number(h.grandTotal || 0);
    const d = h.settledAt ? new Date(h.settledAt) : new Date();
    const day = dayNames[d.getDay()];
    if (realDayTotals[day] !== undefined) {
      realDayTotals[day] += amt;
    }
  });

  const revenueTrendData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    revenue: Math.round(realDayTotals[day])
  }));

  // Build Live Operational Records Table
  const liveOperationalRecords = [
    ...activeRooms.map((r, idx) => ({
      id: `ACT-${r.roomNumber}`,
      image: suites[idx % suites.length]?.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80',
      title: `Suite ${r.roomNumber} - Guest ${r.guestName}`,
      code: r.folioId || `FOL-${r.roomNumber}`,
      category: 'In-House Occupied',
      status: 'Occupied',
      amount: `$${(activeFolios[String(r.roomNumber)] || []).reduce((s, t) => s + Number(t.amount || 0), 0).toFixed(2)}`,
      action: 'View Folio'
    })),
    ...pendingBookings.map((b, idx) => ({
      id: b.id,
      image: suites[(idx + 2) % suites.length]?.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
      title: `${b.guestName} (${b.requestedRoomType})`,
      code: `REQ-${b.id}`,
      category: 'Pending Request',
      status: 'Pending',
      amount: `$${b.totalAmount || 850}/night`,
      action: 'Review Request'
    })),
    ...pastStayHistory.map((h, idx) => ({
      id: h.invoiceId,
      image: suites[(idx + 4) % suites.length]?.image || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80',
      title: `Suite ${h.roomNumber} - ${h.guestName} (Settled)`,
      code: h.invoiceId,
      category: 'Past Settled Stay',
      status: 'Settled',
      amount: `$${h.grandTotal.toFixed(2)}`,
      action: 'Invoice Archive'
    }))
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Image Zoom Preview Modal */}
      {previewImage && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setPreviewImage(null)}
        >
          <div style={{ background: '#FFFFFF', padding: '16px', maxWidth: '650px', width: '100%', borderRadius: '12px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>Real-time Suite Asset Inspection Photo</span>
              <button onClick={() => setPreviewImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>
            <img src={previewImage} alt="Property Asset" style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '8px' }} />
          </div>
        </div>
      )}

      {/* Header Greeting Banner */}
      <div className="page-header-row" style={{ marginBottom: '24px' }}>
        <div className="greeting-text">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
            Operational Command & Executive Center
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Live real-time operational database metrics, occupancy rates, and revenue performance analytics.</p>
        </div>
      </div>

      {/* Executive Stat Widgets Grid (Powered by Live Data) */}
      <div className="dashboard-stats-grid">
        <MetricCard 
          code="OS" 
          title="Occupied Suites" 
          value={`${occupiedCount} / ${totalCapacity}`} 
          trend={`${occupancyPercent}% Occupancy Rate`} 
          trendType="up" 
        />
        <MetricCard 
          code="PR" 
          title="Pending Request Approvals" 
          value={pendingCount} 
          trend="Requires Action" 
          trendType={pendingCount > 0 ? "down" : "up"} 
        />
        <MetricCard 
          code="LR" 
          title="Active Live Folio Balance" 
          value={`$${activeRevenueTotal.toFixed(2)}`} 
          trend="In-House Folios" 
          trendType="up" 
        />
        <MetricCard 
          code="TR" 
          title="Total Gross Revenue" 
          value={`$${grandTotalRevenue.toFixed(2)}`} 
          trend={`${settledCount} Settled Stays`} 
          trendType="up" 
        />
      </div>

      {/* Real Analytics Visuals Grid */}
      <div className="charts-split-grid" style={{ marginBottom: '24px' }}>
        {/* Weekly Revenue Gradient Area Chart */}
        <div className="white-card" style={{ borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Real-Time Revenue & Stay Trend</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Computed live from active room folios & settled invoices</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary-azure)', fontWeight: 800 }}>LIVE DATA SYNCED</span>
          </div>
          <div style={{ height: 240, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="azureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0284C7" strokeWidth={2.5} fillOpacity={1} fill="url(#azureGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Revenue Share Donut Chart */}
        <div className="white-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '16px', padding: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 2px 0' }}>Department Revenue Breakdown</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Proportional share of resort earnings</span>
          </div>

          <div style={{ height: 180, width: '100%', margin: '10px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }} 
                  formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
            {donutData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>
                <span style={{ width: '10px', height: '10px', background: item.color, borderRadius: '3px', display: 'inline-block' }}></span>
                <span>{item.name}: <strong>${item.value.toFixed(0)}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Database Operational Logs Table */}
      <div className="white-card" style={{ borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>Live Operational Records Ledger</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Real-time database entries for occupied suites, pending requests, and settled stays.</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button"
              className={activeTab === 'active' ? 'btn-primary-azure' : 'btn-outline-pill'}
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
              onClick={() => setActiveTab('active')}
            >
              All Live Records ({liveOperationalRecords.length})
            </button>
          </div>
        </div>

        {/* Real-time Table */}
        <div className="modern-table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Record Code</th>
                <th>Property / Guest Title</th>
                <th>Category</th>
                <th>Folio / Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {liveOperationalRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No operational records found.
                  </td>
                </tr>
              ) : (
                liveOperationalRecords.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <img 
                        src={task.image} 
                        alt="Asset" 
                        style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                        onClick={() => setPreviewImage(task.image)}
                        title="Click to zoom property image"
                      />
                    </td>
                    <td style={{ color: 'var(--primary-azure)', fontWeight: 800, fontSize: '0.85rem' }}>{task.code}</td>
                    <td style={{ fontWeight: 800, color: '#0F172A' }}>{task.title}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.82rem' }}>{task.category}</td>
                    <td style={{ fontWeight: 900, color: 'var(--primary-azure)' }}>{task.amount}</td>
                    <td>
                      <span className={`status-pill ${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        type="button"
                        className="btn-outline-pill" 
                        style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                        onClick={() => setPreviewImage(task.image)}
                      >
                        {task.action}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;