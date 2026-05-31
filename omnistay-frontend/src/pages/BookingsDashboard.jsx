import React, { useState, useEffect } from 'react';

const BookingsDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // We use the existing matrix data to populate the bookings table safely!
        fetch('http://localhost:8080/api/rooms/matrix')
            .then(res => res.json())
            .then(data => {
                const activeBookings = data.filter(r => r.status && r.status.toUpperCase() === 'OCCUPIED');
                setBookings(activeBookings);
            })
            .catch(console.error);
    }, []);

    // The Search Filter logic
    const filteredBookings = bookings.filter(b => 
        (b.guest && b.guest.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (b.roomNumber && b.roomNumber.toString().includes(searchTerm))
    );

    return (
        <div style={{ width: '100%', color: '#f8fafc' }}>
            <div className="page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600 }}>Active Bookings</h2>
                    <p style={{ color: '#a1a1aa', margin: '8px 0 0 0' }}>Search and manage current guest reservations.</p>
                </div>
                <div>
                    <input 
                        type="text" 
                        placeholder="Search by name or room..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '10px 15px', borderRadius: '8px', background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '250px' }}
                    />
                </div>
            </div>

            <div style={{ background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: 500 }}>Room #</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: 500 }}>Guest Name</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: 500 }}>Contact (Mock)</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: 500 }}>Status</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: 500 }}>Folio Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No active bookings match your search.</td>
                            </tr>
                        ) : (
                            filteredBookings.map((b, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px', fontWeight: 600 }}>{b.roomNumber}</td>
                                    <td style={{ padding: '16px' }}>{b.guest}</td>
                                    <td style={{ padding: '16px', color: '#94a3b8' }}>+1 555-0198</td> {/* Safe UI Mock for Demo */}
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ background: '#ef444415', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: 'bold' }}>${b.amount || '0.00'}</td>
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