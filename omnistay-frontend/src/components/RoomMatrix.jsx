import React, { useState, useEffect } from 'react';
import GuestFolio from './GuestFolio'; 

const RoomMatrix = () => {
    const [rooms, setRooms] = useState([]);
    const [filter, setFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFolioId, setSelectedFolioId] = useState(null);

    useEffect(() => {
        fetchLiveMatrix();
    }, []);

    const fetchLiveMatrix = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/rooms/matrix');
            if (!response.ok) throw new Error('Network response was not ok');
            const liveData = await response.json();
            setRooms(liveData);
        } catch (error) {
            console.error("Failed to fetch live room matrix:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckout = async (roomId) => {
        // Optimistically flip state to ensure instant UI responsiveness during recording
        setRooms(rooms.map(room => 
            (room.id === roomId || room.roomId === roomId) 
                ? { ...room, status: 'Needs Cleaning', guest: null, amount: null, folioId: null } 
                : room
        ));

        try {
            // Updated to query with standardized enum value to clear 400 Bad Request rejections
            await fetch(`http://localhost:8080/api/rooms/${roomId}/status?status=DIRTY`, { 
                method: 'PUT' 
            });
        } catch (error) {
            console.error("Backend state synchronization deferred:", error);
        }
    };

    const filteredRooms = filter === 'All' ? rooms : rooms.filter(r => r.status && r.status.toUpperCase() === filter.toUpperCase());

    const getStatusColor = (status) => {
        const s = status ? status.toUpperCase() : '';
        if (s === 'AVAILABLE') return '#10b981'; 
        if (s === 'OCCUPIED') return '#ef4444'; 
        return '#f59e0b'; 
    };

    if (isLoading) return <div style={{ color: '#f8fafc', padding: '24px' }}>Syncing with OmniStay Database...</div>;

    // Extract the matching selected room data reference to pass as fallback data to the ledger viewer modal
    const selectedRoomData = rooms.find(r => r.folioId === selectedFolioId);

    return (
        <div style={{ width: '100%', color: '#f8fafc', position: 'relative' }}>
            
            {selectedFolioId && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedFolioId(null)}>
                    <div style={{ width: '700px', maxWidth: '90%', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedFolioId(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                        {/* Pass room configuration properties down to the folio viewer */}
                        <GuestFolio folioId={selectedFolioId} selectedRoom={selectedRoomData} />
                    </div>
                </div>
            )}

            <div className="page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600 }}>Room Matrix</h2>
                    <p style={{ color: '#a1a1aa', margin: '8px 0 0 0' }}>State-driven room asset tracking.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['All', 'Available', 'Occupied', 'Needs Cleaning'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: filter === f ? '#fafafa' : '#18181b', color: filter === f ? '#09090b' : '#a1a1aa', border: `1px solid ${filter === f ? '#fafafa' : 'rgba(255,255,255,0.1)'}`, fontWeight: 500 }}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {filteredRooms.map(room => {
                    const isOccupied = room.status && room.status.toUpperCase() === 'OCCUPIED';
                    
                    return (
                        <div key={room.id || room.roomId} onClick={() => { if (isOccupied && room.folioId) setSelectedFolioId(room.folioId); }} style={{ background: '#18181b', borderRadius: '12px', padding: '24px', borderTop: `4px solid ${getStatusColor(room.status)}`, cursor: isOccupied ? 'pointer' : 'default', transition: 'transform 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc', fontWeight: 600 }}>Room {room.roomNumber}</h3>
                                    <p style={{ color: '#a1a1aa', margin: '4px 0 0 0', fontSize: '0.9rem' }}>{room.roomType || room.type}</p>
                                </div>
                                <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: `${getStatusColor(room.status)}15`, color: getStatusColor(room.status), fontWeight: 600, textTransform: 'uppercase' }}>
                                    {room.status}
                                </span>
                            </div>
                            
                            {isOccupied && room.guest ? (
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                                    <p style={{ color: '#e2e8f0', margin: '0 0 8px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>👤</span> {room.guest}
                                    </p>
                                    <p style={{ color: '#a1a1aa', margin: '0 0 16px 0', fontSize: '0.9rem' }}>
                                        Current Folio: <span style={{ color: '#f8fafc', fontWeight: 500 }}>${room.amount || '0.00'}</span>
                                    </p>
                                    <button style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', fontWeight: 500 }} onClick={(e) => { e.stopPropagation(); handleCheckout(room.id || room.roomId); }}>
                                        Process Checkout
                                    </button>
                                </div>
                            ) : (
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <p style={{ color: '#52525b', fontSize: '0.9rem' }}>No active folio.</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RoomMatrix;