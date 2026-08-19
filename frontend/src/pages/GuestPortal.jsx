import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const GuestPortal = ({ onNavigateCatalog }) => {
  const { logout, userEmail, userPhone } = useAuth();
  const [form, setForm] = useState({ name: '', email: userEmail || '', phone: userPhone || '', checkIn: '', checkOut: '', room: '' });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchAvailableRooms = () => {
    fetch('http://localhost:8000/api/rooms/matrix')
      .then(response => {
        if (!response.ok) throw new Error('Network response failed');
        return response.json();
      })
      .then(data => {
        const available = data.filter(r => r.status && r.status.toUpperCase() === 'AVAILABLE');
        setAvailableRooms(available);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch available rooms:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const handleReservation = async (e) => {
    e.preventDefault();
    if (!form.name || !form.room) return alert("Please enter your name and select a suite.");
    
    setIsSubmitting(true);
    
    const payload = {
      guestName: form.name,
      guestEmail: form.email || userEmail || 'guest@omnistay.com', 
      roomId: form.room, 
      checkIn: form.checkIn,
      checkOut: form.checkOut
    };

    try {
      const response = await fetch('http://localhost:8000/api/v1/enterprise/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      setIsSuccess(true);
      fetchAvailableRooms();

      setTimeout(() => {
        setIsSuccess(false);
        setForm({ name: '', email: userEmail || '', phone: userPhone || '', checkIn: '', checkOut: '', room: '' });
      }, 3500);

    } catch (error) {
      console.error("Booking failed:", error);
      alert("Reservation Processed or Synchronized: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-container" style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <nav className="top-header" style={{ padding: '16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn-outline-pill"
            onClick={logout}
          >
            ← Sign Out
          </button>
          <div className="brand-text" style={{ fontSize: '1.2rem', fontWeight: 900 }}>OmniStay <span>Resorts</span></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button className="btn-outline-pill" onClick={onNavigateCatalog}>
            Find & Reserve Suites Catalog
          </button>
          <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>
            Guest Account: {userEmail || userPhone || 'Guest Member'}
          </span>
        </div>
      </nav>

      <div className="portal-split-layout" style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div className="portal-visual" style={{ background: 'var(--bg-dark-slate)', color: '#FFFFFF', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="status-pill blue" style={{ marginBottom: '16px', width: 'fit-content' }}>Guest Member Hub</span>
          <h1 className="hero-text" style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '16px' }}>Your Luxury Stay Experience.</h1>
          <p style={{ fontSize: '1rem', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '24px' }}>
            Manage active suite reservations, view real-time folio balances, and order in-room dining directly from your personal guest portal.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary-azure" onClick={onNavigateCatalog}>
              Explore Suite Catalog →
            </button>
          </div>
        </div>

        <div className="white-card">
          <h2 style={{ color: '#0F172A', marginBottom: '16px', fontSize: '1.3rem', fontWeight: 900 }}>Direct Suite Reservation</h2>
          
          {isSuccess ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--status-available-bg)', border: '1px solid var(--status-available-border)', color: 'var(--primary-azure)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 900 }}>Reservation Confirmed</h3>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>Your suite has been secured and Folio generated.</p>
            </div>
          ) : (
            <form onSubmit={handleReservation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input 
                type="text" 
                className="form-input-custom" 
                placeholder="Full Name" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="email" className="form-input-custom" style={{ flex: 1 }} placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <input type="tel" className="form-input-custom" style={{ flex: 1 }} placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              
              <select className="form-select-custom" value={form.room} onChange={e => setForm({...form, room: e.target.value})}>
                <option value="">Select an Available Suite...</option>
                {availableRooms.map(room => (
                  <option key={room.roomId || room.id} value={room.roomId || room.id}>
                    Room {room.roomNumber} - {room.roomType || room.type || 'Deluxe Suite'}
                  </option>
                ))}
              </select>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Check-in Date</label>
                  <input type="date" className="form-input-custom" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Check-out Date</label>
                  <input type="date" className="form-input-custom" value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary-azure" 
                style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '6px' }} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Transmitting to ERP...' : 'Confirm Suite Reservation'}
              </button>
            </form>
          )}
          
          <h3 style={{ marginTop: '24px', color: '#0F172A', fontSize: '1rem', fontWeight: 900 }}>Live Suite Availability</h3>
          
          {isLoading ? (
            <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '6px' }}>Connecting to ERP database...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {availableRooms.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '0.82rem' }}>No rooms currently available for online booking.</p>
              ) : (
                availableRooms.map(room => (
                  <div key={room.roomId || room.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--border-light)', border: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>Room {room.roomNumber} - {room.roomType || 'Deluxe'}</span>
                    <span className="status-pill available">AVAILABLE</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestPortal;