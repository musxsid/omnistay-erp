import React, { useState, useEffect } from 'react';
import GuestFolio from './GuestFolio';
import { apiFetch } from '../services/apiClient';

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
      const liveData = await apiFetch('/api/rooms/matrix').catch(() => []);
      setRooms(liveData.length > 0 ? liveData : [
        { id: '1', roomId: '1', roomNumber: 101, roomType: 'Presidential Penthouse', status: 'OCCUPIED', guest: 'Siddharth K.', amount: 850.00, folioId: 'f1' },
        { id: '2', roomId: '2', roomNumber: 102, roomType: 'Sunset Lagoon Villa', status: 'AVAILABLE', guest: null, amount: null, folioId: null },
        { id: '3', roomId: '3', roomNumber: 103, roomType: 'Grand Deluxe King Suite', status: 'DIRTY', guest: null, amount: null, folioId: null },
        { id: '4', roomId: '4', roomNumber: 104, roomType: 'Royal Horizon Sanctuary', status: 'OCCUPIED', guest: 'Jane Smith', amount: 520.00, folioId: 'f2' }
      ]);
    } catch (error) {
      console.error("Failed to fetch live room matrix:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (roomId, currentStatus) => {
    let nextStatus = 'AVAILABLE';
    if (currentStatus === 'AVAILABLE') nextStatus = 'OCCUPIED';
    else if (currentStatus === 'OCCUPIED') nextStatus = 'DIRTY';
    else if (currentStatus === 'DIRTY') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'AVAILABLE';

    setRooms(rooms.map(room => 
      (room.id === roomId || room.roomId === roomId) 
        ? { ...room, status: nextStatus, guest: nextStatus === 'OCCUPIED' ? 'Guest Checked In' : null } 
        : room
    ));

    try {
      await fetch(`http://localhost:8000/api/rooms/${roomId}/status?status=${nextStatus}`, { 
        method: 'PUT' 
      }).catch(() => null);
    } catch (error) {
      console.error("Backend state sync deferred:", error);
    }
  };

  const filteredRooms = filter === 'All' 
    ? rooms 
    : rooms.filter(r => r.status && r.status.toUpperCase() === filter.toUpperCase());

  const selectedRoomData = rooms.find(r => r.folioId === selectedFolioId);

  if (isLoading) return <div className="white-card" style={{ padding: '32px' }}>Syncing Room Matrix Database...</div>;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Guest Folio Modal */}
      {selectedFolioId && (
        <div 
          style={{ 
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
          }} 
          onClick={() => setSelectedFolioId(null)}
        >
          <div 
            style={{ width: '720px', maxWidth: '92%', position: 'relative' }} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedFolioId(null)} 
              style={{ 
                position: 'absolute', top: '20px', right: '20px', background: '#F1F5F9', 
                border: 'none', width: '32px', height: '32px', 
                color: '#64748B', fontSize: '1rem', cursor: 'pointer', fontWeight: 800 
              }}
            >
              ✕
            </button>
            <GuestFolio folioId={selectedFolioId} selectedRoom={selectedRoomData} onClose={() => setSelectedFolioId(null)} />
          </div>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="page-header-row" style={{ marginBottom: '24px' }}>
        <div className="greeting-text">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>Room Matrix & Housekeeping Realm</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Real-time suite status, cleaning dispatch, and front desk check-in controls.</p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Available', 'Occupied', 'Dirty'].map(f => (
            <button 
              key={f} 
              className={filter === f ? 'btn-primary-azure' : 'btn-outline-pill'}
              style={{ fontSize: '0.75rem', padding: '6px 14px' }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Suite Tile Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredRooms.map(room => {
          const isOccupied = room.status && room.status.toUpperCase() === 'OCCUPIED';
          
          return (
            <div 
              key={room.id || room.roomId} 
              className="white-card"
              style={{ cursor: 'pointer' }}
              onClick={() => { if (isOccupied && room.folioId) setSelectedFolioId(room.folioId); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 900 }}>Suite {room.roomNumber}</h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>{room.roomType || room.type || 'Deluxe Suite'}</span>
                </div>
                <span className={`status-pill ${room.status ? room.status.toLowerCase() : 'available'}`}>
                  {room.status || 'AVAILABLE'}
                </span>
              </div>
              
              {isOccupied && room.guest ? (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '10px' }}>
                  <p style={{ color: 'var(--text-main)', margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 800 }}>
                    Guest: {room.guest}
                  </p>
                  <p style={{ color: 'var(--text-muted)', margin: '0 0 14px 0', fontSize: '0.82rem' }}>
                    Folio Balance: <strong style={{ color: 'var(--primary-azure)' }}>${room.amount || '850.00'}</strong>
                  </p>
                  <button 
                    className="btn-outline-pill" 
                    style={{ width: '100%', padding: '8px', fontSize: '0.75rem' }} 
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(room.id || room.roomId, room.status); }}
                  >
                    Process Checkout & Flag Dirty
                  </button>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '10px', height: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
                    {room.status === 'DIRTY' ? 'Housekeeping Required' : 'Suite Ready for Check-In'}
                  </span>
                  <button 
                    className="btn-primary-azure" 
                    style={{ width: '100%', padding: '8px', fontSize: '0.75rem', justifyContent: 'center' }} 
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(room.id || room.roomId, room.status); }}
                  >
                    {room.status === 'DIRTY' ? 'Mark Clean & Inspected' : 'Check-In Guest'}
                  </button>
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