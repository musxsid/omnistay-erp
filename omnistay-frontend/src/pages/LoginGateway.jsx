import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginGateway = () => {
  const { login, setViewMode } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [mode, setMode] = useState('select'); 

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (!login(form.username, form.password)) alert("Access Denied");
  };

  return (
    <div className="gateway-container">
      <div className="gateway-header">
        <h1>OmniStay <span style={{color: '#2563eb'}}>ERP</span></h1>
        <p className="text-muted">Enterprise Management System</p>
      </div>

      {mode === 'select' && (
        <div className="gateway-grid">
          <div className="gate-tile" onClick={() => setMode('admin')}>
            <span className="tile-icon">🔒</span>
            <h3>Admin Portal</h3>
          </div>
          <div className="gate-tile" onClick={() => setViewMode('public')}>
            <span className="tile-icon">🛎️</span>
            <h3>Guest Portal</h3>
          </div>
        </div>
      )}

      {mode === 'admin' && (
        <div className="azia-card" style={{ width: '400px' }}>
          <h3>Admin Login</h3>
          <form onSubmit={handleAdminSubmit} className="form-stack" style={{marginTop: '20px'}}>
            <input type="text" placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} />
            <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
            <button className="massive-btn">Sign In</button>
            <button type="button" className="apple-btn text-only" style={{width: '100%'}} onClick={() => setMode('select')}>Back</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default LoginGateway;