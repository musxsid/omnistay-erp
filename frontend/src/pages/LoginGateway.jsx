import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginGateway = () => {
  const { login, setViewMode } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [mode, setMode] = useState('select'); 
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (!login(form.username, form.password)) {
      setErrorMsg("Access Denied: Invalid credentials.");
      return;
    }
  };

  return (
    <div className="gateway-container">
      <div className="gateway-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'var(--primary-azure)', borderRadius: '20px', color: 'white', fontSize: '2rem', fontWeight: 900, marginBottom: '16px', boxShadow: '0 10px 25px rgba(0, 132, 255, 0.3)' }}>
          O
        </div>
        <h1>OmniStay <span style={{ color: 'var(--primary-azure)' }}>ERP</span></h1>
        <p className="text-muted">Next-Gen Light Enterprise Management System</p>
      </div>

      {mode === 'select' && (
        <div className="gateway-grid">
          <div className="gate-tile" onClick={() => setMode('admin')}>
            <span className="tile-icon">🔒</span>
            <h3>Admin Portal</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '6px' }}>Operations & Management Login</p>
          </div>
          <div className="gate-tile" onClick={() => setViewMode('public')}>
            <span className="tile-icon">🛎️</span>
            <h3>Guest Portal</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '6px' }}>Self-Service Amenities & Folio</p>
          </div>
        </div>
      )}

      {mode === 'admin' && (
        <div className="white-card" style={{ width: '380px', boxShadow: 'var(--shadow-dropdown)', padding: '32px' }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', textAlign: 'center' }}>Admin Access</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', textAlign: 'center', marginBottom: '24px' }}>Sign in to access your works overview.</p>
          
          <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Username</label>
              <input 
                type="text" 
                className="form-input-custom" 
                placeholder="e.g. admin"
                onChange={e => setForm({...form, username: e.target.value})} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Password</label>
              <input 
                type="password" 
                className="form-input-custom" 
                placeholder="••••••••"
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </div>
            <button className="btn-primary-azure" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}>
              Sign In to Command Center
            </button>
            <button 
              type="button" 
              className="btn-outline-pill" 
              style={{ width: '100%', justifyContent: 'center' }} 
              onClick={() => setMode('select')}
            >
              Back to Portal Select
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginGateway;