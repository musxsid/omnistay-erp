import React, { useState, useEffect } from 'react';
import { apiFetch, DEFAULT_PROPERTY_ID } from '../services/apiClient';

const BookingsDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('101');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReservations = async () => {
    try {
      const data = await apiFetch(`/api/v1/reservations/property/${DEFAULT_PROPERTY_ID}`);
      setReservations(data);
    } catch (err) {
      try {
        const matrix = await apiFetch('/api/rooms/matrix');
        setReservations(matrix.map(r => ({
          reservationId: r.id || r.roomId,
          confirmationCode: `CONF-${r.roomNumber}`,
          guestName: r.guest || 'Sample Guest',
          roomNumber: r.roomNumber,
          status: r.status || 'CONFIRMED',
          totalAmount: r.amount || r.dailyRate || 150
        })));
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch('/api/v1/reservations', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: DEFAULT_PROPERTY_ID,
          guestName,
          guestEmail,
          roomNumber: parseInt(roomNumber, 10),
          checkInDate: new Date().toISOString(),
          checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          adultCount: 2
        })
      });
      setShowModal(false);
      setGuestName('');
      setGuestEmail('');
      fetchReservations();
    } catch (err) {
      alert('Failed to create reservation: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (resId) => {
    try {
      await apiFetch(`/api/v1/reservations/${resId}/check-in`, { method: 'POST' });
      fetchReservations();
    } catch (err) {
      alert('Check-in failed: ' + err.message);
    }
  };

  const filtered = reservations.filter(r => 
    (r.guestName && r.guestName.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (r.confirmationCode && r.confirmationCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.roomNumber && String(r.roomNumber).includes(searchTerm))
  );

  return (
    <div style={{ width: '100%' }}>
      {/* Header Row */}
      <div className="page-header-row">
        <div className="greeting-text">
          <h2>Guest Reservation Engine</h2>
          <p>Multi-property booking lifecycle & guest management</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            className="search-bar-input" 
            placeholder="Search confirmation, guest, room..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '280px' }}
          />
          <button className="btn-primary-azure" onClick={() => setShowModal(true)}>
            + New Booking
          </button>
        </div>
      </div>

      {/* New Booking Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateBooking} className="white-card" style={{ width: '440px', boxShadow: 'var(--shadow-dropdown)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>New Guest Reservation</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Guest Full Name</label>
              <input required type="text" className="form-input-custom" value={guestName} onChange={e => setGuestName(e.target.value)} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Email Address</label>
              <input required type="email" className="form-input-custom" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Assigned Room Number</label>
              <input required type="number" className="form-input-custom" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-outline-pill" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary-azure">
                {isSubmitting ? 'Saving...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings Table */}
      <div className="white-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="modern-table-container" style={{ border: 'none' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Confirmation #</th>
                <th>Guest Name</th>
                <th>Room #</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Total Rate</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontWeight: 500 }}>No active bookings found.</td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.reservationId || b.confirmationCode}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-azure)' }}>{b.confirmationCode}</td>
                    <td style={{ fontWeight: 600, color: '#0F172A' }}>{b.guestName || b.guest}</td>
                    <td style={{ fontWeight: 600 }}>Room {b.roomNumber || 'Unassigned'}</td>
                    <td>
                      <span className={`status-pill ${b.status === 'CHECKED_IN' || b.status === 'OCCUPIED' ? 'occupied' : 'available'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, textAlign: 'right', color: '#0F172A' }}>${Number(b.totalAmount || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {b.status === 'CONFIRMED' && (
                        <button className="btn-primary-azure" style={{ padding: '4px 12px', fontSize: '0.8rem', backgroundColor: 'var(--accent-teal)' }} onClick={() => handleCheckIn(b.reservationId)}>
                          Check In
                        </button>
                      )}
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

export default BookingsDashboard;