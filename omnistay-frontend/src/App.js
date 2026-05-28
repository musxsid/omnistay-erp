import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetching data from your Spring Boot Backend running on port 8080
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/dashboard');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("React dashboard data synchronization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const totalCalls = Object.values(metrics).reduce((sum, current) => sum + current, 0);
  const totalUniqueRoutes = Object.keys(metrics).length;

  return (
    <div className="container">
      <header>
        <h1>OmniStay ERP - Official React Console</h1>
        <button className="btn" onClick={fetchMetrics}>Sync Live Metrics</button>
      </header>

      <div className="grid">
        <div className="card">
          <h3>Total Transactions Count</h3>
          <div className="value">{totalCalls}</div>
        </div>
        <div className="card">
          <h3>Monitored API Integrations</h3>
          <div className="value">{totalUniqueRoutes}</div>
        </div>
        <div className="card">
          <h3>Cluster Connection Health</h3>
          <div className="value">
            <span className="status-badge">● OPERATIONAL</span>
          </div>
        </div>
      </div>

      <div className="table-section">
        <h2>Live Enterprise System Traffic Share Matrix</h2>
        {loading ? (
          <div className="spinner">Rebuilding state matrices from active PostgreSQL logs...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>HTTP Request Pipeline Route Endpoint String</th>
                <th>Registered Internal Hit Counts</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(metrics).length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center", color: "#64748b" }}>
                    No traffic detected. Fire requests in Postman to start tracking logs!
                  </td>
                </tr>
              ) : (
                Object.entries(metrics).map(([route, count]) => (
                  <tr key={route}>
                    <td><code><strong>{route}</strong></code></td>
                    <td><span style={{ color: "#10b981", fontWeight: "bold" }}>{count}</span> hits handled</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;