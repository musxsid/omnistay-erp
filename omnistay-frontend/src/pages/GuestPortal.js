import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const GuestPortal = () => {
  const { setViewMode } = useAuth();
  const { rooms, bookingForm, setBookingForm, bookingSuccess, processPublicBooking } = useData();

  return (
    <div className="portal-container">
      <nav className="apple-nav">
        <div className="logo">OmniStay</div>
        <button className="apple-btn text-only" onClick={() => setViewMode('internal')}>Staff Login</button>
      </nav>
      
      <main className="portal-main">
        <h1 className="hero-text">The Standard of Excellence.</h1>
        
        <div className="portal-grid">
          <div className="apple-card">
            <h3>Reserve a Suite</h3>
            {bookingSuccess ? (
              <div className="success-text">Reservation Complete.</div>
            ) : (
              <form onSubmit={processPublicBooking} className="form-stack">
                <input type="text" placeholder="Full Name" value={bookingForm.guestName} onChange={e => setBookingForm({...bookingForm, guestName: e.target.value})} required />
                <input type="email" placeholder="Email" value={bookingForm.guestEmail} onChange={e => setBookingForm({...bookingForm, guestEmail: e.target.value})} required />
                <select value={bookingForm.selectedRoom} onChange={e => setBookingForm({...bookingForm, selectedRoom: e.target.value})}>
                  {rooms.filter(r => r.status === 'AVAILABLE').map(r => (
                    <option key={r.roomNumber} value={r.roomNumber}>Room {r.roomNumber} — {r.roomType} (${r.dailyRate})</option>
                  ))}
                </select>
                <div className="row">
                  <input type="date" value={bookingForm.checkIn} onChange={e => setBookingForm({...bookingForm, checkIn: e.target.value})} required />
                  <input type="date" value={bookingForm.checkOut} onChange={e => setBookingForm({...bookingForm, checkOut: e.target.value})} required />
                </div>
                <button type="submit" className="apple-btn primary">Reserve Now</button>
              </form>
            )}
          </div>

          <div className="apple-card">
            <h3>Availability</h3>
            <div className="list-stack">
              {rooms.map(r => (
                <div key={r.roomNumber} className="list-item">
                  <div>
                    <strong>Room {r.roomNumber}</strong> <span className="text-muted">{r.roomType}</span>
                  </div>
                  <span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuestPortal;