import React, { useState, useEffect } from 'react';
import { apiFetch, DEFAULT_PROPERTY_ID } from '../services/apiClient';

const AdminDashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isAuditRunning, setIsAuditRunning] = useState(false);
    const [auditReport, setAuditReport] = useState(null);

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
            const data = await apiFetch('/api/rooms/matrix');
            setRooms(data);
        } catch (err) {
            console.error("Admin fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTriggerNightAudit = async () => {
        setIsAuditRunning(true);
        try {
            const report = await apiFetch(`/api/v1/audit/night-audit/${DEFAULT_PROPERTY_ID}`, {
                method: 'POST'
            });
            setAuditReport(report);
        } catch (err) {
            alert('Night audit failed: ' + err.message);
        } finally {
            setIsAuditRunning(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this room?")) return;
        try {
            await apiFetch(`/api/rooms/${id}`, { method: 'DELETE' });
            setRooms(rooms.filter(room => (room.id || room.roomId) !== id));
        } catch (error) {
            alert("Failed to delete room.");
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            const addedRoom = await apiFetch('/api/rooms', {
                method: 'POST',
                body: JSON.stringify({
                    roomNumber: parseInt(newRoom.roomNumber, 10),
                    roomType: newRoom.roomType,
                    dailyRate: parseFloat(newRoom.dailyRate),
                    status: newRoom.status
                })
            });
            setRooms([...rooms, addedRoom]);
            setShowAddForm(false);
            setNewRoom({ roomNumber: '', roomType: 'Standard Single', dailyRate: '', status: 'AVAILABLE' });
        } catch (error) {
            alert("Failed to create room.");
        }
    };

    return (
        <div style={{ width: '100%', color: '#f8fafc' }}>
            <div className="page-title" style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600 }}>System & Night Audit Control</h2>
                <p style={{ color: '#a1a1aa', margin: '8px 0 0 0' }}>Manage property assets, Keycloak roles, and business date rollover.</p>
            </div>

            {auditReport && (
                <div style={{ background: '#18181b', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #10b981' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#10b981' }}>✔ Night Audit Execution Report</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', color: '#e2e8f0' }}>
                        <div><strong>Total Rooms:</strong> {auditReport.totalRooms}</div>
                        <div><strong>Occupied:</strong> {auditReport.occupiedRooms} ({Number(auditReport.occupancyPercentage || 0).toFixed(1)}%)</div>
                        <div><strong>Posted Room Charges:</strong> ${Number(auditReport.totalPostedRoomCharges || 0).toFixed(2)}</div>
                        <div><strong>Ledger Balance Verified:</strong> {auditReport.ledgerBalanceVerified ? 'PASS ✅' : 'FAIL ❌'}</div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
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
                                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map(room => (
                                    <tr key={room.id || room.roomId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{room.roomNumber}</td>
                                        <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{room.roomType || room.type}</td>
                                        <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>${Number(room.dailyRate || 0).toFixed(2)}</td>
                                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => handleDelete(room.id || room.roomId)}
                                                style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: '#18181b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#e2e8f0' }}>Night Audit Automation</h3>
                        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '20px' }}>Manually trigger 02:00 AM business date rollover and batch room charge posting.</p>
                        <button
                            onClick={handleTriggerNightAudit}
                            disabled={isAuditRunning}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: '#f59e0b',
                                color: '#09090b',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '1rem',
                                cursor: isAuditRunning ? 'wait' : 'pointer'
                            }}
                        >
                            {isAuditRunning ? 'Running Night Audit...' : '🌙 Run Night Audit Rollover'}
                        </button>
                    </div>

                    <div style={{ background: '#18181b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#e2e8f0' }}>System Health</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#a1a1aa' }}>Keycloak OAuth2:</span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#a1a1aa' }}>PostgreSQL Ledger:</span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Connected</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#a1a1aa' }}>Spring AI Agents:</span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;