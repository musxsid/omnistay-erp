import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // State for the new room form
    const [newRoom, setNewRoom] = useState({
        roomNumber: '',
        roomType: 'Standard Single',
        dailyRate: '',
        status: 'AVAILABLE'
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/rooms');
            const data = await res.json();
            setRooms(data);
        } catch (err) {
            console.error("Admin fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // REAL DELETE FUNCTION
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this room? This action is permanent.")) return;
        
        try {
            const response = await fetch(`http://localhost:8080/api/rooms/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove from UI instantly
                setRooms(rooms.filter(room => (room.id || room.roomId) !== id));
            } else {
                alert("Failed to delete room. It may be tied to an active folio.");
            }
        } catch (error) {
            console.error("Error deleting room:", error);
        }
    };

    // REAL ADD FUNCTION
    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomNumber: parseInt(newRoom.roomNumber),
                    roomType: newRoom.roomType,
                    dailyRate: parseFloat(newRoom.dailyRate),
                    status: newRoom.status
                })
            });

            if (response.ok) {
                const addedRoom = await response.json();
                setRooms([...rooms, addedRoom]);
                setShowAddForm(false); // Hide form
                setNewRoom({ roomNumber: '', roomType: 'Standard Single', dailyRate: '', status: 'AVAILABLE' }); // Reset form
            } else {
                alert("Failed to create room. Check your inputs.");
            }
        } catch (error) {
            console.error("Error adding room:", error);
        }
    };

    return (
        <div style={{ width: '100%', color: '#f8fafc' }}>
            <div className="page-title" style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600 }}>System Administration</h2>
                <p style={{ color: '#a1a1aa', margin: '8px 0 0 0' }}>Manage global ERP configurations, physical assets, and access controls.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                {/* Left Column: Asset Management Table */}
                <div style={{ background: '#18181b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: '#e2e8f0' }}>Room Asset Database</h3>
                        <button 
                            onClick={() => setShowAddForm(!showAddForm)}
                            style={{ background: showAddForm ? '#ef4444' : '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            {showAddForm ? 'Cancel' : '+ Add New Room'}
                        </button>
                    </div>

                    {/* NEW: Dynamic Add Room Form */}
                    {showAddForm && (
                        <form onSubmit={handleAddRoom} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '4px' }}>Room Number</label>
                                <input type="number" required value={newRoom.roomNumber} onChange={e => setNewRoom({...newRoom, roomNumber: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#09090b', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '4px' }}>Type</label>
                                <select value={newRoom.roomType} onChange={e => setNewRoom({...newRoom, roomType: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#09090b', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <option>Standard Single</option>
                                    <option>Executive Double</option>
                                    <option>Deluxe King</option>
                                    <option>Presidential Suite</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '4px' }}>Daily Rate ($)</label>
                                <input type="number" step="0.01" required value={newRoom.dailyRate} onChange={e => setNewRoom({...newRoom, dailyRate: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#09090b', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                            </div>
                            <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                        </form>
                    )}

                    {isLoading ? (
                        <p style={{ color: '#64748b' }}>Connecting to PostgreSQL...</p>
                    ) : (
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ color: '#a1a1aa', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '12px 8px' }}>Room #</th>
                                    <th style={{ padding: '12px 8px' }}>Type</th>
                                    <th style={{ padding: '12px 8px' }}>Base Rate</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Admin Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map(room => (
                                    <tr key={room.id || room.roomId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{room.roomNumber}</td>
                                        <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{room.roomType || room.type}</td>
                                        <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>${(room.dailyRate || 0).toFixed(2)}</td>
                                        <td style={{ padding: '12px 8px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button 
                                                onClick={() => handleDelete(room.id || room.roomId)}
                                                style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                onMouseOut={(e) => e.target.style.background = 'transparent'}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Right Column: System Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: '#18181b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#e2e8f0' }}>System Health</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#a1a1aa' }}>Database:</span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Connected</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#a1a1aa' }}>AI Gateway:</span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Online (Groq)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#a1a1aa' }}>JWT Security:</span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;