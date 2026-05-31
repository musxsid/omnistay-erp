import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const GuestPortal = () => {
  const { setViewMode } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', checkIn: '', checkOut: '', room: '' });
  
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchAvailableRooms = () => {
    fetch('http://localhost:8080/api/rooms/matrix')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        const available = data.filter(r => r.status && r.status.toUpperCase() === 'AVAILABLE');
        setAvailableRooms(available);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch real rooms. Ensure backend is running.", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const handleReservation = async (e) => {
    e.preventDefault();
    if (!form.name || !form.room) return alert("Please fill in your name and select a suite.");
    
    setIsSubmitting(true);
    
    const payload = {
        guestName: form.name,
        guestEmail: form.email || 'guest@omnistay.com', 
        roomId: form.room, 
        checkIn: form.checkIn,
        checkOut: form.checkOut
    };

    try {
        const response = await fetch('http://localhost:8080/api/v1/enterprise/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
          setForm({ name: '', email: '', phone: '', checkIn: '', checkOut: '', room: '' });
        }, 3500);

    } catch (error) {
        console.error("Booking failed:", error);
        alert("Transaction Failed: " + error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-container">
      <nav className="apple-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
                onClick={() => setViewMode('select')}
                style={{ background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
                ← Back
            </button>
            <div className="logo" style={{ margin: 0 }}>OmniStay Resorts</div>
        </div>
        <div style={{cursor: 'pointer', fontWeight: 600, color: '#94a3b8'}} onClick={() => setViewMode('select')}>
          Staff Portal
        </div>
      </nav>

      <div className="portal-split-layout">
        <div className="portal-visual">
          <h1 className="hero-text">The Standard of Excellence.</h1>
          <p style={{fontSize: '1.2rem', color: '#e2e8f0', maxWidth: '500px'}}>
            Experience world-class luxury, tailored to your exact specifications.
          </p>
        </div>

        <div className="portal-booking-section">
          <h2 style={{color: '#0f172a', marginBottom: '20px'}}>Reserve a Suite</h2>
          
          {isSuccess ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
               <h3 style={{ color: '#166534', margin: '0 0 10px 0', fontSize: '1.5rem' }}>Reservation Confirmed!</h3>
               <p style={{ color: '#15803d', margin: 0 }}>Your suite has been secured and Folio generated. We look forward to your stay.</p>
            </div>
          ) : (
            <form className="form-stack" onSubmit={handleReservation}>
              <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              
              {/* Email and Phone Inline Grid */}
              <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                <input type="email" style={{ flex: 1 }} placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <input type="tel" style={{ flex: 1 }} placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              
              <select style={{color: '#0f172a', background: 'white'}} value={form.room} onChange={e => setForm({...form, room: e.target.value})}>
                <option value="">Select a Suite...</option>
                {availableRooms.map(room => (
                    <option key={room.roomId || room.id} value={room.roomId || room.id}>
                        Room {room.roomNumber} - {room.roomType || room.type}
                    </option>
                ))}
              </select>
              
              <div style={{display: 'flex', gap: '15px', marginTop: '5px'}}>
                 <div style={{flex: 1}}>
                     <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px'}}>Check-in Date</label>
                     <input type="date" style={{color: '#0f172a', background: 'white'}} value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} />
                 </div>
                 <div style={{flex: 1}}>
                     <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px'}}>Check-out Date</label>
                     <input type="date" style={{color: '#0f172a', background: 'white'}} value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} />
                 </div>
              </div>

              <button type="submit" className="massive-btn" style={{marginTop: '20px', opacity: isSubmitting ? 0.7 : 1}} disabled={isSubmitting}>
                {isSubmitting ? 'Transmitting to ERP...' : 'Confirm Reservation'}
              </button>
            </form>
          )}
          
          <h3 style={{marginTop: '30px', color: '#0f172a'}}>Live Availability</h3>
          
          {isLoading ? (
            <p className="text-muted" style={{color: '#64748b'}}>Establishing secure connection to servers...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {availableRooms.length === 0 ? (
                 <p style={{color: '#64748b'}}>No rooms currently available.</p>
              ) : (
                availableRooms.map(room => (
                  <div key={room.roomId || room.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Room {room.roomNumber}</span>
                    <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                      {room.status}
                    </span>
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