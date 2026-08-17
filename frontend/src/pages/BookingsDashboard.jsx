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
            console.warn("Falling back to room matrix for bookings query.");
            try {
                const matrix = await apiFetch('/api/rooms/matrix');
                setReservations(matrix.map(r => ({
                    reservationId: r.id || r.roomId,
                    confirmationCode: `CONF-${r.roomNumber}`,
                    guestName: r.guest || 'Sample Guest',
                    roomNumber: r.roomNumber,
                    status: r.status,
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
        <div style={{ width: '100%', color: '#f8fafc' }}>
            <div className="page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600 }}>Guest Reservation Engine</h2>
                    <p style={{ color: '#a1a1aa', margin: '8px 0 0 0' }}>Multi-property booking lifecycle management.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                        type="text" 
                        placeholder="Search confirmation, guest, room..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '10px 15px', borderRadius: '8px', background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '260px' }}
                    />
                    <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                        + New Booking
                    </button>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <form onSubmit={handleCreateBooking} style={{ background: '#18181b', padding: '32px', borderRadius: '12px', width: '420px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem' }}>New Guest Reservation</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '6px' }}>Guest Full Name</label>
                            <input required type="text" value={guestName} onChange={e => setGuestName(e.target.value)} style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '6px' }}>Email Address</label>
                            <input required type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '6px' }}>Assigned Room Number</label>
                            <input required type="number" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', background: 'transparent', color: '#a1a1aa', border: 'none', cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                                {isSubmitting ? 'Saving...' : 'Confirm Reservation'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: 500 }}>Confirmation #</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: 500 }}>Guest Name</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: 500 }}>Room #</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: 500 }}>Status</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: 500, textAlign: 'right' }}>Total Rate</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: 500, textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No active bookings found.</td>
                            </tr>
                        ) : (
                            filtered.map((b) => (
                                <tr key={b.reservationId || b.confirmationCode} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px', fontWeight: 600, color: '#38bdf8' }}>{b.confirmationCode}</td>
                                    <td style={{ padding: '16px' }}>{b.guestName || b.guest}</td>
                                    <td style={{ padding: '16px', fontWeight: 600 }}>Room {b.roomNumber || 'Unassigned'}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ 
                                            background: b.status === 'CHECKED_IN' || b.status === 'OCCUPIED' ? '#ef444415' : '#10b98115', 
                                            color: b.status === 'CHECKED_IN' || b.status === 'OCCUPIED' ? '#ef4444' : '#10b981', 
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' 
                                        }}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: 'bold', textAlign: 'right' }}>${Number(b.totalAmount || 0).toFixed(2)}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {b.status === 'CONFIRMED' && (
                                            <button onClick={() => handleCheckIn(b.reservationId)} style={{ padding: '6px 12px', background: '#10b981', color: '#09090b', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>
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
    );
};

export default BookingsDashboard;