import React, { useState } from 'react';
import { useFolioLedgers } from '../services/folioLedgerStore';

const BookingsDashboard = ({ globalSearch = '' }) => {
  const { pendingBookings, activeRooms, activeFolios, approveBooking, declineBooking, checkoutRoom } = useFolioLedgers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACTIVE'

  // Combine local search and global topbar search
  const effectiveQuery = (searchTerm || globalSearch || '').trim();

  // Vast Multi-Field Real-Time Deep Search Matcher
  const matchRecord = (item, extraData = {}) => {
    if (!effectiveQuery) return true;
    const q = effectiveQuery.toLowerCase();

    const textPool = [
      item.guestName,
      item.guestEmail,
      item.guestPhone,
      item.requestedRoomType,
      item.roomNumber ? `Suite ${item.roomNumber}` : '',
      item.roomNumber ? String(item.roomNumber) : '',
      item.id,
      item.folioId,
      item.status,
      item.totalAmount ? String(item.totalAmount) : '',
      item.checkIn,
      item.checkOut,
      extraData.deptCode,
      ...(extraData.txns ? extraData.txns.map(t => `${t.description} ${t.departmentCode} $${t.amount}`) : [])
    ].filter(Boolean).map(s => String(s).toLowerCase());

    return textPool.some(field => field.includes(q));
  };

  // Room Allocation Modal State
  const [selectedPendingBooking, setSelectedPendingBooking] = useState(null);
  const [assignRoomNum, setAssignRoomNum] = useState('101');

  // Checkout Invoice Modal State
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);
  const [selectedRoomToCheckout, setSelectedRoomToCheckout] = useState(null);

  const [allocationError, setAllocationError] = useState('');

  const handleApproveSubmit = (e) => {
    e.preventDefault();
    if (!selectedPendingBooking || !assignRoomNum) return;

    try {
      setAllocationError('');
      approveBooking(selectedPendingBooking.id, assignRoomNum);
      setSelectedPendingBooking(null);
    } catch (err) {
      setAllocationError(err.message);
    }
  };

  const selectedRoomOccupant = activeRooms.find(r => String(r.roomNumber) === String(assignRoomNum));

  const handleDeclineBooking = (booking) => {
    if (window.confirm(`Decline reservation request for ${booking.guestName} (${booking.requestedRoomType})?`)) {
      declineBooking(booking.id);
    }
  };

  const handleOpenCheckoutModal = (room) => {
    setSelectedRoomToCheckout(room);
    const roomNum = String(room.roomNumber);
    const folioTxns = activeFolios[roomNum] || [];
    const subtotal = folioTxns.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const taxAmount = subtotal * 0.10;
    const grandTotal = subtotal + taxAmount;

    setCheckoutInvoice({
      invoiceId: `INV-${roomNum}-${Date.now().toString().slice(-6)}`,
      roomNumber: roomNum,
      guestName: room.guestName,
      guestEmail: room.guestEmail,
      guestPhone: room.guestPhone,
      checkIn: room.checkIn,
      checkOut: new Date().toISOString(),
      subtotal,
      taxAmount,
      grandTotal,
      transactions: folioTxns
    });
  };

  const handleFinalizeCheckout = () => {
    if (!selectedRoomToCheckout) return;
    checkoutRoom(selectedRoomToCheckout.roomNumber);
    setCheckoutInvoice(null);
    setSelectedRoomToCheckout(null);
  };

  const filteredPending = pendingBookings.filter(b => matchRecord(b));

  const filteredActive = activeRooms.filter(r => {
    const roomNum = String(r.roomNumber);
    const txns = activeFolios[roomNum] || [];
    return matchRecord(r, { txns });
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header Row */}
      <div className="page-header-row no-print" style={{ marginBottom: '20px' }}>
        <div className="greeting-text">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>Front Desk Command & Settlement Engine</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Process guest booking approvals, room allocations, live folio charges, and professional checkout billing.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {effectiveQuery && (
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-azure)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Searching: "{effectiveQuery}" ({filteredPending.length + filteredActive.length} matches)</span>
              <button 
                type="button"
                onClick={() => setSearchTerm('')} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 900, color: '#0284C7', fontSize: '0.85rem', padding: 0 }}
                title="Clear Search"
              >
                ✕
              </button>
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="search-bar-input" 
              placeholder="Vast Search: guest, room #, email, suite, folio, charges..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '340px', paddingRight: searchTerm ? '32px' : '14px' }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', fontWeight: 800, fontSize: '0.9rem' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Slider / Segmented Filter Bar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', background: '#E2E8F0', padding: '4px', borderRadius: '30px', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            style={{
              padding: '8px 22px',
              borderRadius: '24px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              background: activeTab === 'ALL' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'ALL' ? 'var(--primary-azure)' : '#64748B',
              boxShadow: activeTab === 'ALL' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            All Logs ({pendingBookings.length + activeRooms.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            style={{
              padding: '8px 22px',
              borderRadius: '24px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              background: activeTab === 'PENDING' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'PENDING' ? '#B45309' : '#64748B',
              boxShadow: activeTab === 'PENDING' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Pending Requests</span>
            {pendingBookings.length > 0 && (
              <span style={{ background: '#F59E0B', color: '#FFFFFF', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 900 }}>
                {pendingBookings.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            style={{
              padding: '8px 22px',
              borderRadius: '24px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              background: activeTab === 'ACTIVE' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'ACTIVE' ? 'var(--primary-azure)' : '#64748B',
              boxShadow: activeTab === 'ACTIVE' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Active Folios</span>
            <span style={{ background: 'var(--primary-azure)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 900 }}>
              {activeRooms.length}
            </span>
          </button>
        </div>
      </div>

      {/* 1. PENDING BOOKING REQUESTS - SLEEK HORIZONTAL ROWS */}
      {(activeTab === 'ALL' || activeTab === 'PENDING') && (
        <div className="no-print" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                Pending Booking Requests
              </h3>
              <span className="status-pill blue" style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' }}>
                {pendingBookings.length} Awaiting Approval
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Action Required: Review guest details & allocate room or decline
            </span>
          </div>

          {filteredPending.length === 0 ? (
            <div className="white-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '16px' }}>
              No pending reservation requests found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredPending.map(b => (
                <div 
                  key={b.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px 24px', 
                    background: '#FFFFFF', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Left Column: Guest Avatar & Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                      {b.guestName ? b.guestName.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1.02rem', color: '#0F172A' }}>{b.guestName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {b.guestEmail || 'No Email'} • {b.guestPhone || 'No Phone'}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Requested Suite & Dates */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1, padding: '0 24px', justifyContent: 'space-around' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Suite Requested</span>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--primary-azure)' }}>{b.requestedRoomType}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Nightly Rate</span>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>${b.totalAmount || 850}/night</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Stay Window</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                        {b.checkIn} &rarr; {b.checkOut}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Actions (Decline & Approve) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      type="button"
                      style={{ 
                        padding: '10px 18px', 
                        borderRadius: '30px', 
                        border: '1px solid #FECACA', 
                        background: '#FEF2F2', 
                        color: '#DC2626', 
                        fontWeight: 800, 
                        fontSize: '0.8rem', 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleDeclineBooking(b)}
                    >
                      Decline Request
                    </button>
                    <button 
                      type="button"
                      className="btn-primary-azure" 
                      style={{ padding: '10px 20px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap' }}
                      onClick={() => { setSelectedPendingBooking(b); setAssignRoomNum('101'); }}
                    >
                      Approve & Allocate Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ACTIVE OCCUPIED ROOMS & FOLIO SETTLEMENT TABLE */}
      {(activeTab === 'ALL' || activeTab === 'ACTIVE') && (
        <div className="white-card no-print" style={{ borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                Active Occupied Room Folios ({activeRooms.length})
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Live guest folios ready for in-room service posts and checkout settlement.
              </p>
            </div>
            <span className="status-pill blue" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>Live Front Desk Control</span>
          </div>

          <div className="modern-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Room #</th>
                  <th>Guest Name</th>
                  <th>Check-In Date</th>
                  <th>Status</th>
                  <th>Live Folio Total</th>
                  <th style={{ textAlign: 'right' }}>Checkout Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredActive.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      No rooms currently occupied. Pending requests above will populate active rooms once approved.
                    </td>
                  </tr>
                ) : (
                  filteredActive.map((room) => {
                    const roomNum = String(room.roomNumber);
                    const roomTxns = activeFolios[roomNum] || [];
                    const currentTotal = roomTxns.reduce((sum, t) => sum + Number(t.amount || 0), 0);

                    return (
                      <tr key={roomNum}>
                        <td style={{ fontWeight: 900, color: 'var(--primary-azure)', fontSize: '1.05rem' }}>
                          Suite {roomNum}
                        </td>
                        <td style={{ fontWeight: 800, color: '#0F172A' }}>{room.guestName}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {new Date(room.checkIn).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="status-pill occupied">OCCUPIED</span>
                        </td>
                        <td style={{ fontWeight: 900, color: 'var(--primary-azure)', fontSize: '1.05rem' }}>
                          ${currentTotal.toFixed(2)} ({roomTxns.length} charges)
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            type="button"
                            className="btn-primary-azure"
                            style={{ fontSize: '0.78rem', padding: '8px 16px', background: '#DC2626', borderRadius: '20px' }}
                            onClick={() => handleOpenCheckoutModal(room)}
                          >
                            Check-Out & Settle Bill
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== 1. ROOM ALLOCATION MODAL ==================== */}
      {selectedPendingBooking && (
        <div className="auth-modal-overlay" onClick={() => setSelectedPendingBooking(null)}>
          <div className="auth-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button 
              onClick={() => setSelectedPendingBooking(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '6px' }}>Approve Booking & Allocate Room</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Guest: <strong>{selectedPendingBooking.guestName}</strong> • Suite: <strong>{selectedPendingBooking.requestedRoomType}</strong>
            </p>

            <form onSubmit={handleApproveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Select Room Number to Assign</label>
                <select 
                  className="form-select-custom" 
                  value={assignRoomNum} 
                  onChange={e => { setAssignRoomNum(e.target.value); setAllocationError(''); }}
                >
                  {['101', '102', '103', '104', '201', '202'].map(num => {
                    const occ = activeRooms.find(r => String(r.roomNumber) === String(num));
                    return (
                      <option key={num} value={num}>
                        Suite {num} - {occ ? `OCCUPIED (${occ.guestName})` : 'AVAILABLE'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedRoomOccupant ? (
                <div style={{ background: '#FEF2F2', padding: '14px', border: '1px solid #FCA5A5', borderRadius: '8px', fontSize: '0.82rem', color: '#B91C1C' }}>
                  <strong>⚠️ Suite {assignRoomNum} is NOT Available!</strong><br />
                  Currently occupied by <strong>{selectedRoomOccupant.guestName}</strong> (Folio ID: {selectedRoomOccupant.folioId}).<br />
                  Scheduled Check-Out: <strong>{selectedRoomOccupant.checkOut || 'Active'}</strong>.<br />
                  Please select an available suite to proceed.
                </div>
              ) : (
                <div style={{ background: '#F8FAFC', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Folio ID will be generated automatically.<br />
                  Room will be activated across all Restaurant, Housekeeping, and Spa POS terminals.
                </div>
              )}

              {(allocationError || selectedRoomOccupant) && (
                <div style={{ color: '#DC2626', fontSize: '0.8rem', fontWeight: 700 }}>
                  {allocationError || `Cannot assign Suite ${assignRoomNum} because it is currently occupied.`}
                </div>
              )}

              <button 
                type="submit"
                className="btn-primary-azure" 
                disabled={Boolean(selectedRoomOccupant)}
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  padding: '12px',
                  opacity: selectedRoomOccupant ? 0.5 : 1,
                  cursor: selectedRoomOccupant ? 'not-allowed' : 'pointer'
                }}
              >
                Confirm Room Allocation & Check In Guest
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 2. PROFESSIONAL CHECKOUT INVOICE MODAL ==================== */}
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

export default BookingsDashboard;