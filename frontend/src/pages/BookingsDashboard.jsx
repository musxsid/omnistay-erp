import React, { useState } from 'react';
import { useFolioLedgers } from '../services/folioLedgerStore';

const BookingsDashboard = () => {
  const { pendingBookings, activeRooms, activeFolios, approveBooking, checkoutRoom } = useFolioLedgers();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Room Allocation Modal State
  const [selectedPendingBooking, setSelectedPendingBooking] = useState(null);
  const [assignRoomNum, setAssignRoomNum] = useState('101');

  // Checkout Invoice Modal State
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);
  const [selectedRoomToCheckout, setSelectedRoomToCheckout] = useState(null);

  const handleApproveSubmit = (e) => {
    e.preventDefault();
    if (!selectedPendingBooking || !assignRoomNum) return;

    approveBooking(selectedPendingBooking.id, assignRoomNum);
    setSelectedPendingBooking(null);
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

  const filteredActive = activeRooms.filter(r => 
    (r.guestName && r.guestName.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (r.roomNumber && String(r.roomNumber).includes(searchTerm))
  );

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header Row */}
      <div className="page-header-row" style={{ marginBottom: '20px' }}>
        <div className="greeting-text">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>Front Desk Command & Settlement Engine</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Process guest booking approvals, room allocations, live folio charges, and professional checkout billing.</p>
        </div>
        <div>
          <input 
            type="text" 
            className="search-bar-input" 
            placeholder="Search occupied guest or room #..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '280px' }}
          />
        </div>
      </div>

      {/* 1. PENDING BOOKING REQUESTS NOTIFICATION BANNER */}
      {pendingBookings.length > 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '18px 24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔔 Pending Booking Requests ({pendingBookings.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 800 }}>Action Required: Verify Payment & Allocate Room</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
            {pendingBookings.map(b => (
              <div key={b.id} className="white-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)' }}>{b.guestName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {b.requestedRoomType} • ${b.totalAmount}/night
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#0084FF', fontWeight: 700, marginTop: '2px' }}>
                    Dates: {b.checkIn} → {b.checkOut}
                  </div>
                </div>
                <button 
                  className="btn-primary-azure" 
                  style={{ fontSize: '0.78rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
                  onClick={() => { setSelectedPendingBooking(b); setAssignRoomNum('101'); }}
                >
                  Approve & Allocate Room
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ACTIVE OCCUPIED ROOMS & FOLIO SETTLEMENT TABLE */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
            Active Occupied Room Folios ({activeRooms.length})
          </h3>
          <span className="status-pill blue">Live Front Desk Control</span>
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
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
                        Room {roomNum}
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{room.guestName}</td>
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
                          className="btn-primary-azure"
                          style={{ fontSize: '0.78rem', padding: '6px 12px', background: '#DC2626' }}
                          onClick={() => handleOpenCheckoutModal(room)}
                        >
                          🔑 Check-Out & Generate Bill
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
                <select className="form-select-custom" value={assignRoomNum} onChange={e => setAssignRoomNum(e.target.value)}>
                  <option value="101">Room 101 - Presidential Suite (Available)</option>
                  <option value="102">Room 102 - Executive Sunset Lagoon Villa (Available)</option>
                  <option value="103">Room 103 - Grand Deluxe King Suite (Available)</option>
                  <option value="204">Room 204 - Royal Horizon Sanctuary (Available)</option>
                </select>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                ✔ Folio ID will be generated automatically.<br />
                ✔ Room will be activated across all Restaurant, Housekeeping, and Spa POS terminals.
              </div>

              <button className="btn-primary-azure" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Confirm Room Allocation & Check In Guest
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 2. PROFESSIONAL CHECKOUT INVOICE MODAL ==================== */}
      {checkoutInvoice && (
        <div className="auth-modal-overlay" onClick={() => setCheckoutInvoice(null)}>
          <div className="auth-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', padding: '32px' }}>
            <button 
              onClick={() => setCheckoutInvoice(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>

            {/* Official Hotel Bill Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-subtle)', paddingBottom: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
                OMNISTAY LUXURY RESORTS & SPA
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                OFFICIAL GUEST FOLIO SETTLEMENT INVOICE • TAX ID: TAX-984201-RESORT
              </div>
            </div>

            {/* Guest & Room Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
              <div>
                <div>Guest Name: <strong>{checkoutInvoice.guestName}</strong></div>
                <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Email: {checkoutInvoice.guestEmail || 'N/A'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Assigned Room: <strong>Suite {checkoutInvoice.roomNumber}</strong></div>
                <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Invoice #: <strong>{checkoutInvoice.invoiceId}</strong></div>
              </div>
            </div>

            {/* Itemized Charges Table Categorized by Department */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 900, margin: '0 0 10px 0' }}>Itemized Department Charges Statement</h4>
            <div className="modern-table-container" style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '20px' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Department</th>
                    <th>Item Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {checkoutInvoice.transactions.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <span className="status-pill blue" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                          {t.departmentCode}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>{t.description}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary-azure)' }}>
                        ${Number(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Billing Summary Totals */}
            <div style={{ borderTop: '2px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Subtotal Charges: <strong>${checkoutInvoice.subtotal.toFixed(2)}</strong>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Resort Luxury Tax (10%): <strong>${checkoutInvoice.taxAmount.toFixed(2)}</strong>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-azure)', marginTop: '4px' }}>
                Grand Total Settled: ${checkoutInvoice.grandTotal.toFixed(2)}
              </div>
            </div>

            {/* Final Settlement Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="btn-outline-pill" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => window.print()}
              >
                🖨️ Print / Download PDF Receipt
              </button>
              <button 
                type="button" 
                className="btn-primary-azure" 
                style={{ flex: 1, justifyContent: 'center', background: '#10B981' }}
                onClick={handleFinalizeCheckout}
              >
                🔑 Key Received — Settle & Mark Room Vacant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsDashboard;