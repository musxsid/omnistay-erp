import React, { useState, useEffect } from 'react';
import GuestFolio from './GuestFolio';
import SuiteDetailsModal from './SuiteDetailsModal';
import { apiFetch } from '../services/apiClient';
import { useFolioLedgers } from '../services/folioLedgerStore';
import { useAuth } from '../context/AuthContext';

const RoomMatrix = ({ globalSearch = '', forcedMode = null }) => {
  const { activeRooms, activeFolios, roomStatuses, updateRoomStatus, directCheckIn, checkoutRoom } = useFolioLedgers();
  const { userRole } = useAuth();

  const getInitialRoleView = () => {
    if (forcedMode === 'HOUSEKEEPING') return 'CLEANING_STAFF';
    if (forcedMode === 'FRONT_DESK') return 'FRONT_DESK';
    return userRole === 'STAFF_HOUSEKEEPING' ? 'CLEANING_STAFF' : 'FRONT_DESK';
  };

  const [rooms, setRooms] = useState([]);
  const [activeRoleView, setActiveRoleView] = useState(getInitialRoleView);
  const [noticeMsg, setNoticeMsg] = useState('');

  useEffect(() => {
    if (forcedMode === 'HOUSEKEEPING') setActiveRoleView('CLEANING_STAFF');
    else if (forcedMode === 'FRONT_DESK') setActiveRoleView('FRONT_DESK');
    else if (userRole === 'STAFF_HOUSEKEEPING') setActiveRoleView('CLEANING_STAFF');
  }, [forcedMode, userRole]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolioId, setSelectedFolioId] = useState(null);
  const [previewSuite, setPreviewSuite] = useState(null);

  // Check-In Guest Modal State
  const [checkInTargetRoom, setCheckInTargetRoom] = useState(null);
  const [guestFormData, setGuestFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    nightlyRate: '450'
  });
  const [checkInError, setCheckInError] = useState('');

  // Checkout Invoice & Key Received Settlement Modal State
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);
  const [selectedRoomToCheckout, setSelectedRoomToCheckout] = useState(null);

  useEffect(() => {
    fetchLiveMatrix();
  }, []);

  const fetchLiveMatrix = async () => {
    try {
      const liveData = await apiFetch('/api/rooms/matrix').catch(() => []);
      const defaultRooms = [
        { id: '1', roomId: '1', roomNumber: 101, roomType: 'Presidential Ocean Penthouse', status: 'AVAILABLE', guest: null, amount: 850.00 },
        { id: '2', roomId: '2', roomNumber: 102, roomType: 'Executive Sunset Lagoon Villa', status: 'AVAILABLE', guest: null, amount: 520.00 },
        { id: '3', roomId: '3', roomNumber: 103, roomType: 'Grand Deluxe King Suite', status: 'DIRTY', guest: null, amount: 340.00 },
        { id: '4', roomId: '4', roomNumber: 104, roomType: 'Royal Horizon Sanctuary', status: 'AVAILABLE', guest: null, amount: 680.00 },
        { id: '5', roomId: '5', roomNumber: 105, roomType: 'Imperial Beachfront Pool Villa', status: 'AVAILABLE', guest: null, amount: 920.00 },
        { id: '6', roomId: '6', roomNumber: 106, roomType: 'Celestial Panorama Suite', status: 'DIRTY', guest: null, amount: 490.00 },
        { id: '7', roomId: '7', roomNumber: 201, roomType: 'Executive Ocean View Suite', status: 'AVAILABLE', guest: null, amount: 420.00 },
        { id: '8', roomId: '8', roomNumber: 202, roomType: 'Garden Paradise Villa', status: 'AVAILABLE', guest: null, amount: 380.00 },
        { id: '9', roomId: '9', roomNumber: 203, roomType: 'Royal Sapphire Spa Pavilion', status: 'AVAILABLE', guest: null, amount: 750.00 },
        { id: '10', roomId: '10', roomNumber: 204, roomType: 'Emerald Canopy Bungalow', status: 'AVAILABLE', guest: null, amount: 460.00 },
        { id: '11', roomId: '11', roomNumber: 205, roomType: 'Coral Bay Overwater Suite', status: 'DIRTY', guest: null, amount: 610.00 },
        { id: '12', roomId: '12', roomNumber: 206, roomType: 'Diamond Terrace Penthouse', status: 'AVAILABLE', guest: null, amount: 890.00 },
        { id: '13', roomId: '13', roomNumber: 301, roomType: 'Ambassador Oceanfront Suite', status: 'AVAILABLE', guest: null, amount: 580.00 },
        { id: '14', roomId: '14', roomNumber: 302, roomType: 'Orchid Garden Sanctuary', status: 'AVAILABLE', guest: null, amount: 390.00 },
        { id: '15', roomId: '15', roomNumber: 303, roomType: 'Infinity Cliffside Residence', status: 'AVAILABLE', guest: null, amount: 950.00 },
        { id: '16', roomId: '16', roomNumber: 304, roomType: 'Pearl Bay Deluxe King', status: 'AVAILABLE', guest: null, amount: 320.00 }
      ];
      setRooms(liveData.length > 0 ? liveData : defaultRooms);
    } catch (error) {
      console.error("Failed to fetch live room matrix:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Check-In Modal for an available room
  const handleOpenCheckInModal = (room) => {
    setCheckInTargetRoom(room);
    setGuestFormData({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      nightlyRate: String(room.amount || 450)
    });
    setCheckInError('');
  };

  // Submit Front Desk Direct Check-In Form
  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    if (!checkInTargetRoom || !guestFormData.guestName.trim()) {
      setCheckInError('Please enter guest full name.');
      return;
    }

    try {
      setCheckInError('');
      const roomNum = String(checkInTargetRoom.roomNumber);

      const adminPredefinedRate = Number(checkInTargetRoom.amount || 450);

      directCheckIn({
        roomNumber: roomNum,
        roomType: checkInTargetRoom.roomType || 'Deluxe Suite',
        guestName: guestFormData.guestName.trim(),
        guestEmail: guestFormData.guestEmail.trim(),
        guestPhone: guestFormData.guestPhone.trim(),
        checkIn: guestFormData.checkIn,
        checkOut: guestFormData.checkOut,
        nightlyRate: adminPredefinedRate
      });

      // Update room matrix status globally
      updateRoomStatus(roomNum, 'OCCUPIED');

      setCheckInTargetRoom(null);
    } catch (err) {
      setCheckInError(err.message);
    }
  };

  // Front Desk Action: Open Professional Checkout Invoice & Key Settlement Modal
  const handleOpenCheckoutModal = (room) => {
    const roomNum = String(room.roomNumber);
    const activeOcc = activeRooms.find(ar => String(ar.roomNumber) === roomNum);
    const folioTxns = activeFolios[roomNum] || [
      { id: `tx-${roomNum}-init`, date: new Date().toISOString(), description: `Room ${roomNum} Lodging Stay Rate`, amount: Number(room.amount || 450), departmentCode: 'ROOM' }
    ];
    const subtotal = folioTxns.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const taxAmount = subtotal * 0.10;
    const grandTotal = subtotal + taxAmount;

    setSelectedRoomToCheckout(room);
    setCheckoutInvoice({
      invoiceId: `INV-${roomNum}-${Date.now().toString().slice(-6)}`,
      roomNumber: roomNum,
      guestName: activeOcc?.guestName || room.guest || 'Active Guest',
      guestEmail: activeOcc?.guestEmail || 'guest@omnistay.com',
      guestPhone: activeOcc?.guestPhone || '+1 (555) 000-0000',
      checkIn: activeOcc?.checkIn || new Date().toISOString(),
      checkOut: new Date().toISOString(),
      subtotal,
      taxAmount,
      grandTotal,
      transactions: folioTxns
    });
  };

  const handleFinalizeCheckout = () => {
    if (!selectedRoomToCheckout) return;
    const key = String(selectedRoomToCheckout.roomNumber);
    checkoutRoom(key);
    updateRoomStatus(key, 'DIRTY');
    setCheckoutInvoice(null);
    setSelectedRoomToCheckout(null);
    setNoticeMsg(`Suite ${key} checkout finalized. Key received, folio settled, and room flagged DIRTY for Housekeeping.`);
    setTimeout(() => setNoticeMsg(''), 4000);
  };

  // Front Desk Action: Assign Cleaning Staff
  const handleAssignCleaningTask = (roomNumber) => {
    const key = String(roomNumber);
    updateRoomStatus(key, 'CLEANING_IN_PROGRESS');
    setNoticeMsg(`Cleaning request dispatched to Housekeeping Panel for Suite ${roomNumber}.`);
    setTimeout(() => setNoticeMsg(''), 4000);
  };

  // Housekeeping Staff Action: Approve Cleaning Request & Begin Cleaning
  const handleApproveCleaningRequest = (roomNumber) => {
    const key = String(roomNumber);
    updateRoomStatus(key, 'CLEANING_IN_PROGRESS');
    setNoticeMsg(`Housekeeping team approved request for Suite ${roomNumber}. Deep cleaning & sanitation in progress.`);
    setTimeout(() => setNoticeMsg(''), 4000);
  };

  // Cleaning Staff Action: Mark Clean & Inspected
  const handleMarkCleanAndInspected = (roomNumber) => {
    const key = String(roomNumber);
    updateRoomStatus(key, 'AVAILABLE');
    setNoticeMsg(`Suite ${roomNumber} marked CLEAN & INSPECTED. Now available for Front Desk check-in!`);
    setTimeout(() => setNoticeMsg(''), 4000);
  };

  // Merge live activeRooms state & global roomStatuses store with Room Matrix list
  const combinedRooms = rooms.map(r => {
    const key = String(r.roomNumber);
    const activeOcc = activeRooms.find(ar => String(ar.roomNumber) === key);
    if (activeOcc) {
      const roomTxns = activeFolios[key] || [];
      const currentBalance = roomTxns.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      return {
        ...r,
        status: 'OCCUPIED',
        guest: activeOcc.guestName,
        folioId: activeOcc.folioId,
        amount: currentBalance || activeOcc.nightlyRate || r.amount
      };
    }

    // Global room status from store overrides default fallback
    const globalStatus = roomStatuses[key] || r.status || 'AVAILABLE';
    return {
      ...r,
      status: globalStatus,
      guest: null
    };
  });

  const filteredRooms = combinedRooms.filter(r => {
    const statusUpper = (r.status || 'AVAILABLE').toUpperCase();
    if (filter === 'Available') return statusUpper === 'AVAILABLE';
    if (filter === 'Occupied') return statusUpper === 'OCCUPIED';
    if (filter === 'Dirty') return statusUpper === 'DIRTY' || statusUpper === 'CLEANING_IN_PROGRESS';
    
    if (!globalSearch || !globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase().trim();
    return (
      (r.guest && r.guest.toLowerCase().includes(q)) ||
      (r.roomNumber && String(r.roomNumber).includes(q)) ||
      (r.roomType && r.roomType.toLowerCase().includes(q)) ||
      (r.status && r.status.toLowerCase().includes(q))
    );
  });

  const selectedRoomData = combinedRooms.find(r => r.folioId === selectedFolioId);
  const dirtyOrCleaningRooms = combinedRooms.filter(r => r.status === 'DIRTY' || r.status === 'CLEANING_IN_PROGRESS');

  if (isLoading) return <div className="white-card" style={{ padding: '32px' }}>Syncing Room Matrix Database...</div>;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Read-Only Suite Details Showcase Modal for Front Desk Staff */}
      {previewSuite && (
        <SuiteDetailsModal 
          suite={previewSuite}
          onClose={() => setPreviewSuite(null)}
          onAction={(room) => {
            if (room.status === 'OCCUPIED' && room.folioId) {
              setSelectedFolioId(room.folioId);
            } else if (room.status !== 'DIRTY' && room.status !== 'CLEANING_IN_PROGRESS') {
              handleOpenCheckInModal(room);
            }
          }}
          actionText={
            previewSuite.status === 'OCCUPIED' 
              ? 'View Active Guest Folio' 
              : (previewSuite.status === 'DIRTY' || previewSuite.status === 'CLEANING_IN_PROGRESS' 
                  ? 'Awaiting Housekeeping Service' 
                  : 'Proceed to Front Desk Check-In')
          }
        />
      )}

      {/* Guest Folio Modal */}
      {selectedFolioId && (
        <div 
          className="no-print"
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
                color: '#64748B', fontSize: '1rem', cursor: 'pointer', fontWeight: 800, borderRadius: '6px'
              }}
            >
              ✕
            </button>
            <GuestFolio folioId={selectedFolioId} selectedRoom={selectedRoomData} onClose={() => setSelectedFolioId(null)} />
          </div>
        </div>
      )}

      {/* Front Desk Walk-In Direct Check-In Modal */}
      {checkInTargetRoom && (
        <div className="auth-modal-overlay no-print" onClick={() => setCheckInTargetRoom(null)}>
          <div className="auth-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', padding: '28px' }}>
            <button 
              onClick={() => setCheckInTargetRoom(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '4px' }}>
              Front Desk Walk-In Check-In
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Suite <strong>{checkInTargetRoom.roomNumber}</strong> • {checkInTargetRoom.roomType || 'Deluxe Suite'}
            </p>

            <form onSubmit={handleCheckInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {checkInError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {checkInError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Guest Full Name *</label>
                <input 
                  type="text" 
                  className="search-bar-input" 
                  placeholder="e.g. Siddharth Kumar" 
                  required
                  value={guestFormData.guestName}
                  onChange={e => setGuestFormData({ ...guestFormData, guestName: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</label>
                  <input 
                    type="email" 
                    className="search-bar-input" 
                    placeholder="guest@example.com"
                    value={guestFormData.guestEmail}
                    onChange={e => setGuestFormData({ ...guestFormData, guestEmail: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Phone Number</label>
                  <input 
                    type="text" 
                    className="search-bar-input" 
                    placeholder="+1 (555) 000-0000"
                    value={guestFormData.guestPhone}
                    onChange={e => setGuestFormData({ ...guestFormData, guestPhone: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Check-In Date</label>
                  <input 
                    type="date" 
                    className="search-bar-input"
                    value={guestFormData.checkIn}
                    onChange={e => setGuestFormData({ ...guestFormData, checkIn: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Check-Out Date</label>
                  <input 
                    type="date" 
                    className="search-bar-input"
                    value={guestFormData.checkOut}
                    onChange={e => setGuestFormData({ ...guestFormData, checkOut: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Predefined Nightly Room Rate (Admin Configured)</label>
                <div style={{ background: '#F1F5F9', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 900, color: 'var(--primary-azure)', fontSize: '1.05rem' }}>
                    ${Number(checkInTargetRoom.amount || 450).toFixed(2)} USD / night
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#E2E8F0', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontWeight: 800 }}>
                    Fixed Admin Rate
                  </span>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Direct front-desk entry bypasses pending approval and activates guest folio across POS systems.
              </div>

              <button 
                type="submit" 
                className="btn-primary-azure" 
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.85rem', fontWeight: 800 }}
              >
                Complete Check-In & Activate Folio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Action Notice Alert */}
      {noticeMsg && (
        <div className="no-print" style={{ background: '#EFF6FF', border: '1px solid #93C5FD', color: '#1E40AF', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.86rem', fontWeight: 700 }}>
          {noticeMsg}
        </div>
      )}

      {/* Top Header Row & Staff View Mode Switcher */}
      <div className="page-header-row no-print" style={{ marginBottom: '24px' }}>
        <div className="greeting-text">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {activeRoleView === 'CLEANING_STAFF' ? 'Housekeeping Operations & Sanitation Realm' : 'Front Desk Suite Matrix & Check-In'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {activeRoleView === 'CLEANING_STAFF' 
              ? 'Real-time housekeeping queue, cleaning dispatch approvals, and deep sanitation inspections.'
              : '16 Database Suites • Direct walk-in check-in, guest folios, and site gallery inspection.'}
          </p>
        </div>

        {/* Operational Staff View Mode Switcher (Hidden if locked to Housekeeping staff) */}
        {userRole !== 'STAFF_HOUSEKEEPING' && !forcedMode && (
          <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '30px', border: '1px solid #E2E8F0' }}>
            <button 
              type="button"
              className={activeRoleView === 'FRONT_DESK' ? 'btn-primary-azure' : 'btn-outline-pill'}
              style={{ fontSize: '0.78rem', padding: '6px 16px', border: 'none' }}
              onClick={() => setActiveRoleView('FRONT_DESK')}
            >
              Front Desk Realm View
            </button>
            <button 
              type="button"
              className={activeRoleView === 'CLEANING_STAFF' ? 'btn-primary-azure' : 'btn-outline-pill'}
              style={{ fontSize: '0.78rem', padding: '6px 16px', border: 'none' }}
              onClick={() => setActiveRoleView('CLEANING_STAFF')}
            >
              Housekeeping Staff Panel ({dirtyOrCleaningRooms.length})
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: FRONT DESK REALM VIEW */}
      {activeRoleView === 'FRONT_DESK' && (
        <div className="no-print">
          {/* Sub Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Showing {filteredRooms.length} of {combinedRooms.length} Total Resort Suites
            </span>
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

          {/* Grid of 16 Suite Tile Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredRooms.map(room => {
              const isOccupied = room.status && room.status.toUpperCase() === 'OCCUPIED';
              const isDirty = room.status && room.status.toUpperCase() === 'DIRTY';
              const isCleaning = room.status && room.status.toUpperCase() === 'CLEANING_IN_PROGRESS';
              
              return (
                <div 
                  key={room.id || room.roomId || room.roomNumber} 
                  className="white-card"
                  style={{ cursor: 'pointer', borderLeft: isDirty ? '4px solid #F59E0B' : (isCleaning ? '4px solid #3B82F6' : '1px solid var(--border-subtle)') }}
                  onClick={() => {
                    if (isOccupied && room.folioId) {
                      setSelectedFolioId(room.folioId);
                    } else {
                      setPreviewSuite(room);
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 900 }}>Suite {room.roomNumber}</h3>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>{room.roomType || room.type || 'Deluxe Suite'}</span>
                    </div>
                    <span className={`status-pill ${room.status ? room.status.toLowerCase() : 'available'}`}>
                      {room.status === 'CLEANING_IN_PROGRESS' ? 'CLEANING IN PROGRESS' : (room.status || 'AVAILABLE')}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--primary-azure)', fontWeight: 800, marginBottom: '12px' }}>
                    📷 Click Card to View Site Gallery & Specs
                  </div>
                  
                  {isOccupied && room.guest ? (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '10px' }}>
                      <p style={{ color: 'var(--text-main)', margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 800 }}>
                        Guest: {room.guest}
                      </p>
                      <p style={{ color: 'var(--text-muted)', margin: '0 0 14px 0', fontSize: '0.82rem' }}>
                        Folio Balance: <strong style={{ color: 'var(--primary-azure)' }}>${Number(room.amount || 0).toFixed(2)}</strong>
                      </p>
                      <button 
                        type="button"
                        className="btn-outline-pill" 
                        style={{ width: '100%', padding: '8px', fontSize: '0.75rem', justifyContent: 'center' }} 
                        onClick={(e) => { e.stopPropagation(); handleOpenCheckoutModal(room); }}
                      >
                        Process Checkout & Flag Dirty
                      </button>
                    </div>
                  ) : (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '10px', height: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
                        {isDirty ? 'Awaiting Housekeeping Dispatch' : (isCleaning ? 'Cleaning Staff Servicing Room...' : 'Suite Ready for Check-In')}
                      </span>

                      {isDirty ? (
                        /* Front Desk CANNOT mark clean; Front Desk ASSIGNS cleaning to Housekeeping Panel */
                        <button 
                          type="button"
                          className="btn-primary-azure" 
                          style={{ width: '100%', padding: '8px', fontSize: '0.75rem', justifyContent: 'center', background: '#F59E0B', borderColor: '#D97706' }} 
                          onClick={(e) => { e.stopPropagation(); handleAssignCleaningTask(room.roomNumber); }}
                        >
                          Assign Cleaning Staff
                        </button>
                      ) : isCleaning ? (
                        <div style={{ padding: '8px', background: '#EFF6FF', color: '#1E40AF', borderRadius: '6px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                          Dispatched to Housekeeping Team
                        </div>
                      ) : (
                        <button 
                          type="button"
                          className="btn-primary-azure" 
                          style={{ width: '100%', padding: '8px', fontSize: '0.75rem', justifyContent: 'center' }} 
                          onClick={(e) => { e.stopPropagation(); handleOpenCheckInModal(room); }}
                        >
                          Check-In Guest
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: HOUSEKEEPING & CLEANING STAFF PANEL */}
      {activeRoleView === 'CLEANING_STAFF' && (
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Domain-Specific Housekeeping Analytics Visual Header Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="white-card" style={{ padding: '16px 20px', borderLeft: '4px solid #F59E0B' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Cleaning Queue</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
                {dirtyOrCleaningRooms.length} Suites
              </div>
              <span style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: 800 }}>Action Required</span>
            </div>

            <div className="white-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10B981' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clean Suite Ratio</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>
                {Math.round(((combinedRooms.length - dirtyOrCleaningRooms.length) / combinedRooms.length) * 100)}%
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>{combinedRooms.length - dirtyOrCleaningRooms.length} of {combinedRooms.length} Ready</span>
            </div>

            <div className="white-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--primary-azure)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Turnaround Time</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
                24.5 Mins
              </div>
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800 }}>▼ -3.2 mins faster</span>
            </div>

            <div className="white-card" style={{ padding: '16px 20px', borderLeft: '4px solid #8B5CF6' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sanitation Index</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
                100 / 100
              </div>
              <span style={{ fontSize: '0.72rem', color: '#8B5CF6', fontWeight: 800 }}>Grade A Clean</span>
            </div>
          </div>

          <div className="white-card" style={{ borderRadius: '14px', padding: '18px 24px', borderLeft: '4px solid #3B82F6' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)' }}>
              🧹 Housekeeping Dispatch & Operational Requests Queue
            </h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Review room cleaning requests dispatched by Front Desk. Click <strong>"Approve & Begin Cleaning"</strong> to acknowledge, then <strong>"Mark Clean & Inspected"</strong> once deep sanitation is complete.
            </p>
          </div>

          {dirtyOrCleaningRooms.length === 0 ? (
            <div className="white-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '16px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✨</div>
              <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontWeight: 800 }}>All Resort Suites Are Clean & Inspected</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No pending housekeeping cleaning requests in queue.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dirtyOrCleaningRooms.map(room => {
                const isCleaningInProg = room.status === 'CLEANING_IN_PROGRESS';
                return (
                  <div 
                    key={room.roomNumber} 
                    className="white-card" 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '16px 24px', 
                      borderRadius: '12px',
                      borderLeft: isCleaningInProg ? '5px solid #3B82F6' : '5px solid #F59E0B'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: isCleaningInProg ? '#EFF6FF' : '#FEF3C7', color: isCleaningInProg ? '#2563EB' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                        {room.roomNumber}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>Suite {room.roomNumber}</span>
                          <span className={`status-pill ${isCleaningInProg ? 'blue' : 'dirty'}`} style={{ fontSize: '0.7rem' }}>
                            {isCleaningInProg ? 'CLEANING IN PROGRESS' : 'DISPATCH REQUESTED'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                          {room.roomType || 'Deluxe Suite'} • Predefined Rate: ${room.amount}/night • Dispatched by Front Desk
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {isCleaningInProg ? (
                        <button 
                          type="button"
                          className="btn-primary-azure" 
                          style={{ padding: '9px 20px', fontSize: '0.8rem', background: '#10B981', borderColor: '#059669', fontWeight: 800, borderRadius: '8px' }}
                          onClick={() => handleMarkCleanAndInspected(room.roomNumber)}
                        >
                          ✓ Mark Clean & Inspected
                        </button>
                      ) : (
                        <button 
                          type="button"
                          className="btn-primary-azure" 
                          style={{ padding: '9px 20px', fontSize: '0.8rem', background: '#3B82F6', borderColor: '#2563EB', fontWeight: 800, borderRadius: '8px' }}
                          onClick={() => handleApproveCleaningRequest(room.roomNumber)}
                        >
                          ▶ Approve & Begin Cleaning
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== PROFESSIONAL CHECKOUT INVOICE MODAL ==================== */}
      {checkoutInvoice && (
        <div className="auth-modal-overlay" onClick={() => setCheckoutInvoice(null)}>
          <div className="auth-modal-box printable-invoice-modal" onClick={e => e.stopPropagation()} style={{ width: '92%', maxWidth: '860px', padding: '36px 44px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px' }}>
            <button 
              type="button"
              className="no-print"
              onClick={() => setCheckoutInvoice(null)}
              style={{ position: 'absolute', top: '20px', right: '24px', background: '#F1F5F9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>

            {/* Official Hotel Bill Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-subtle)', paddingBottom: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.8px' }}>
                OMNISTAY LUXURY RESORTS & SPA
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                OFFICIAL GUEST FOLIO SETTLEMENT INVOICE • TAX ID: TAX-984201-RESORT
              </div>
            </div>

            {/* Guest & Room Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#F8FAFC', padding: '20px 24px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.92rem', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div>Guest Name: <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{checkoutInvoice.guestName}</strong></div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Email: <strong>{checkoutInvoice.guestEmail || 'N/A'}</strong></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Assigned Suite: <strong style={{ color: 'var(--primary-azure)', fontSize: '1rem' }}>Suite {checkoutInvoice.roomNumber}</strong></div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Invoice #: <strong>{checkoutInvoice.invoiceId}</strong></div>
              </div>
            </div>

            {/* Itemized Department Charges Statement */}
            <h4 style={{ fontSize: '1.05rem', fontWeight: 900, margin: '0 0 14px 0', color: 'var(--text-main)' }}>Itemized Department Charges Statement</h4>
            <div className="modern-table-container" style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '24px', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
              <table className="modern-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '140px', padding: '12px 16px' }}>Date & Time</th>
                    <th style={{ width: '130px', padding: '12px 16px' }}>Department</th>
                    <th style={{ padding: '12px 16px' }}>Item Description</th>
                    <th style={{ width: '140px', textAlign: 'right', padding: '12px 16px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {checkoutInvoice.transactions.map((t, idx) => (
                    <tr key={t.id || idx}>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {new Date(t.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="status-pill blue" style={{ fontSize: '0.72rem', padding: '4px 10px', fontWeight: 800 }}>
                          {t.departmentCode || 'ROOM'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', padding: '12px 16px', lineHeight: '1.4' }}>{t.description}</td>
                      <td style={{ textAlign: 'right', fontWeight: 900, color: 'var(--primary-azure)', fontSize: '0.95rem', padding: '12px 16px' }}>
                        ${Number(t.amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Billing Summary Totals */}
            <div style={{ borderTop: '2px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', marginBottom: '28px' }}>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Subtotal Charges: <strong style={{ color: 'var(--text-main)' }}>${checkoutInvoice.subtotal.toFixed(2)}</strong>
              </div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Resort Luxury Tax (10%): <strong style={{ color: 'var(--text-main)' }}>${checkoutInvoice.taxAmount.toFixed(2)}</strong>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-azure)', marginTop: '4px' }}>
                Grand Total Settled: ${checkoutInvoice.grandTotal.toFixed(2)}
              </div>
            </div>

            {/* Final Settlement Actions (Hidden when printing PDF receipt) */}
            <div className="no-print" style={{ display: 'flex', gap: '16px' }}>
              <button 
                type="button" 
                className="btn-outline-pill" 
                style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: '0.88rem', fontWeight: 800 }}
                onClick={() => window.print()}
              >
                Print / Download PDF Receipt
              </button>
              <button 
                type="button" 
                className="btn-primary-azure" 
                style={{ flex: 1.2, justifyContent: 'center', background: '#10B981', borderColor: '#059669', fontWeight: 900, padding: '14px', fontSize: '0.9rem', borderRadius: '30px' }}
                onClick={handleFinalizeCheckout}
              >
                Key Received — Settle & Mark Room Vacant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomMatrix;