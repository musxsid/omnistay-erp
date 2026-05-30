import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginGateway = () => {
  const { login, setViewMode } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError(true);
    }
  };

  return (
    <div className="gateway-container">
      <div className="apple-card login-box">
        <h2>OmniStay ERP</h2>
        <p className="subtitle">Sign in to Operations</p>
        <form onSubmit={handleSubmit} className="form-stack">
          {error && <div className="error-text">Incorrect credentials</div>}
          <input type="text" placeholder="Admin ID" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="apple-btn primary">Sign In</button>
        </form>
        <button className="apple-btn text-only" onClick={() => setViewMode('public')}>Return to Guest Portal</button>
      </div>
    </div>
  );
};

export default LoginGateway;