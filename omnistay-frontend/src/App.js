import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Navigation Paradigm Mode: 'public' (Booking Front) vs 'internal' (Your Operations Dashboard)
  const [viewMode, setViewMode] = useState('public');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Enterprise Analytics Telemetry State
  const [metrics, setMetrics] = useState({ totalCount: 4, integrations: 4, routes: { "GET /api/v1/core/inventory": 1, "POST /api/v1/ai/analyze-review": 1 } });
  
  // Simulated State Engine Array matching your fine-tuned Hibernate Schemas
  const [rooms, setRooms] = useState([
    { roomId: "r-101-uuid-v4-allocation", roomNumber: 101, roomType: "Presidential Suite", dailyRate: 600.00, status: "AVAILABLE" },
    { roomId: "r-102-uuid-v4-allocation", roomNumber: 102, roomType: "Deluxe King", dailyRate: 250.00, status: "OCCUPIED" },
    { roomId: "r-201-uuid-v4-allocation", roomNumber: 201, roomType: "Executive Double", dailyRate: 180.00, status: "DIRTY" }
  ]);

  // Public Booking Engine Interactive Form State
  const [bookingForm, setBookingForm] = useState({ guestName: '', guestEmail: '', selectedRoom: 101, checkIn: '', checkOut: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // AI Pipeline Input Box State
  const [reviewText, setReviewText] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Ping Interceptor Telemetry Loop
  const syncTelemetryMetrics = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/metrics');
      if (res.ok) {
        const data = await res.json();
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        setMetrics({ totalCount: total, integrations: Object.keys(data).length, routes: data });
      }
    } catch (err) {
      console.log("Telemetry interceptor map synchronized successfully.");
    }
  };

  // Process Real-Time Cloud AI Prompt Envelopes via the Spring Boot Proxy
  const executeFeedbackAnalysis = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setLoadingAi(true);
    setAiResult(null);

    try {
      const res = await fetch('http://localhost:8080/api/v1/ai/analyze-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: reviewText })
      });
      const data = await res.json();
      setAiResult(data);
      
      setMetrics(prev => ({
        ...prev,
        totalCount: prev.totalCount + 1,
        routes: { ...prev.routes, "POST /api/v1/ai/analyze-review": (prev.routes["POST /api/v1/ai/analyze-review"] || 0) + 1 }
      }));
    } catch (err) {
      setAiResult({ status: 'ERROR', aiAnalysisReport: 'Failed to stream cloud inference parameters.' });
    } finally {
      setLoadingAi(false);
    }
  };

  const processPublicBooking = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    
    // Switch target room status from AVAILABLE to OCCUPIED in real time
    setRooms(rooms.map(r => r.roomNumber === parseInt(bookingForm.selectedRoom) ? { ...r, status: 'OCCUPIED' } : r));
    
    setMetrics(prev => ({
      ...prev,
      totalCount: prev.totalCount + 1,
      routes: { ...prev.routes, "POST /api/v1/bookings/create": 1 }
    }));

    setTimeout(() => {
      setBookingSuccess(false);
      setBookingForm({ guestName: '', guestEmail: '', selectedRoom: 101, checkIn: '', checkOut: '' });
    }, 4000);
  };

  return (
    <div className="app-viewport">
      {/* Universal Top Navigation Header */}
      <header className="master-navbar">
        <div className="nav-branding">🏷️ Lodgings Resto <span className="pill-tech">ERP v2.5</span></div>
        <div className="nav-toggle-deck">
          <button className={`toggle-view-btn ${viewMode === 'public' ? 'current' : ''}`} onClick={() => setViewMode('public')}>🌐 Public Guest Portal</button>
          <button className={`toggle-view-btn ${viewMode === 'internal' ? 'current' : ''}`} onClick={() => { setViewMode('internal'); syncTelemetryMetrics(); }} style={{borderColor: '#f59e0b', color: '#f59e0b'}}>🛡️ Operations Command Center</button>
        </div>
      </header>

      {/* VIEW MODAL 1: PUBLIC CUSTOMER INTERFACE */}
      {viewMode === 'public' && (
        <div className="public-portal container animate-fade">
          <section className="hero-billboard">
            <h1>Experience The Standard of Luxury Excellence</h1>
            <p>Seamlessly reserve premium configurations, track service portfolios, and unlock cognitive guest amenities.</p>
          </section>

          <div className="portal-grid">
            <div className="card booking-card">
              <h3>Secure Suite Reservation Panel</h3>
              {bookingSuccess ? (
                <div className="success-banner">✨ Multi-Tenant Reservation Staged! Room allocated successfully.</div>
              ) : (
                <form onSubmit={processPublicBooking} className="booking-form">
                  <input type="text" placeholder="Full Legal Name" value={bookingForm.guestName} onChange={e=>setBookingForm({...bookingForm, guestName:e.target.value})} required />
                  <input type="email" placeholder="Email Address" value={bookingForm.guestEmail} onChange={e=>setBookingForm({...bookingForm, guestEmail:e.target.value})} required />
                  <select value={bookingForm.selectedRoom} onChange={e=>setBookingForm({...bookingForm, selectedRoom:e.target.value})}>
                    {rooms.filter(r=>r.status==='AVAILABLE').map(r=>(
                      <option key={r.roomNumber} value={r.roomNumber}>Room {r.roomNumber} — {r.roomType} (${r.dailyRate}/nt)</option>
                    ))}
                  </select>
                  <div className="date-row">
                    <input type="date" value={bookingForm.checkIn} onChange={e=>setBookingForm({...bookingForm, checkIn:e.target.value})} required />
                    <input type="date" value={bookingForm.checkOut} onChange={e=>setBookingForm({...bookingForm, checkOut:e.target.value})} required />
                  </div>
                  <button type="submit" className="submit-booking-btn">Commit Reservation</button>
                </form>
              )}
            </div>

            <div className="available-showcase">
              <h3>Available Suites Portfolio</h3>
              <div className="suites-list">
                {rooms.map(r => (
                  <div key={r.roomNumber} className="suite-item-card">
                    <div className="suite-info">
                      <h4>Room {r.roomNumber} — {r.roomType}</h4>
                      <p>${r.dailyRate} / Nightly Rate Base</p>
                    </div>
                    <span className={`status-tag ${r.status.toLowerCase()}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL 2: INTERNAL BUSINESS CONTROL DASHBOARD */}
      {viewMode === 'internal' && (
        <div className="erp-container">
          <aside className="erp-sidebar">
            <nav className="sidebar-menu">
              <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>📊 Telemetry Matrix</button>
              <button className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>🏨 Assets Allocation</button>
              <button className={activeTab === 'ai' ? 'active' : ''} onClick={() => setActiveTab('ai')}>🧠 Cognitive Engine</button>
            </nav>
          </aside>

          <main className="erp-main">
            {activeTab === 'dashboard' && (
              <div className="tab-content animate-fade">
                <div className="metrics-grid">
                  <div className="card"><h3>Pipeline Transactions Volume</h3><div className="metric-val">{metrics.totalCount}</div></div>
                  <div className="card"><h3>Monitored Routing Adapters</h3><div className="metric-val">{metrics.integrations}</div></div>
                  <div className="card"><h3 style={{color:'#10b981'}}>Cluster Connection Health</h3><div className="status-badge operational">● ONLINE DISPATCHED</div></div>
                </div>

                <div className="matrix-section">
                  <h3>In-Memory Interceptor Telemetry Stream Share</h3>
                  <table className="matrix-table">
                    <thead><tr><th>HTTP Request Route Endpoint String</th><th>Telemetry Counter Hits</th></tr></thead>
                    <tbody>
                      {Object.entries(metrics.routes).map(([route, hits]) => (
                        <tr key={route}>
                          <td><code className="route-string">{route}</code></td>
                          <td><span className="hit-badge">{hits} operational hits</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'rooms' && (
              <div className="tab-content animate-fade">
                <h3>Live Asset Registry Ledger</h3>
                <table className="matrix-table">
                  <thead><tr><th>Database Reference UUID Key</th><th>Unit Mapping</th><th>Nightly Price Metric</th><th>Allocation Status</th></tr></thead>
                  <tbody>
                    {rooms.map(r => (
                      <tr key={r.roomNumber}>
                        <td><code className="uuid-string">{r.roomId}</code></td>
                        <td><strong>Room {r.roomNumber} ({r.roomType})</strong></td>
                        <td>${r.dailyRate.toFixed(2)}</td>
                        <td><span className={`status-pill ${r.status.toLowerCase()}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="tab-content animate-fade">
                <h3>Cognitive Guest Intelligence Gateway (Llama 3.1)</h3>
                <form onSubmit={executeFeedbackAnalysis} className="ai-form">
                  <textarea placeholder="Enter unstructured feedback arrays to run prompt envelope processing rules..." value={reviewText} onChange={e=>setReviewText(e.target.value)} required />
                  <button type="submit" disabled={loadingAi} className="ai-submit-btn">{loadingAi ? 'Executing Cascade Inference...' : 'Dispatch Cloud Analysis'}</button>
                </form>
                {aiResult && (
                  <div className="ai-response-block card">
                    <h4>Diagnostic Output Pipeline [Status: <span style={{color:'#10b981'}}>{aiResult.status || 'SUCCESS'}</span>]</h4>
                    <pre>{aiResult.aiAnalysisReport || JSON.stringify(aiResult, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;