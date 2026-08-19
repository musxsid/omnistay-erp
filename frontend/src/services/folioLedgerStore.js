import { useState, useEffect } from 'react';
import { apiFetch } from './apiClient';

class FolioLedgerStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadInitialState();
    this.syncWithBackend();
  }

  loadInitialState() {
    try {
      const stored = localStorage.getItem('omnistay_enterprise_state');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("State parse error:", e);
    }

    // Clean initial state (Zero hardcoded dummy charges!)
    return {
      pendingBookings: [
        {
          id: 'BK-1001',
          guestName: 'Siddharth K.',
          guestEmail: 'siddharth@omnistay.com',
          guestPhone: '+1 (555) 234-5678',
          requestedRoomType: 'Presidential Ocean Penthouse',
          checkIn: new Date().toISOString().split('T')[0],
          checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          status: 'PENDING_APPROVAL',
          totalAmount: 850.00
        }
      ],
      activeRooms: [], // Currently occupied rooms e.g. { roomNumber: 101, guestName, folioId, status: 'OCCUPIED' }
      activeFolios: {}, // "101": [ { id, date, description, amount, departmentCode } ]
      roomStatuses: {
        "103": "DIRTY",
        "106": "DIRTY",
        "205": "DIRTY"
      },
      pastStayHistory: [], // Master historical archive of completed guest stays & settled bills
      posHistory: {
        F_AND_B: [],
        HOUSEKEEPING: [],
        SPA: []
      }
    };
  }

  save() {
    try {
      localStorage.setItem('omnistay_enterprise_state', JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.error("Save state error:", e);
    }
  }

  async syncWithBackend() {
    try {
      const matrix = await apiFetch('/api/rooms/matrix').catch(() => null);
      if (matrix && Array.isArray(matrix)) {
        // Sync active rooms if backend has occupied rooms
        matrix.filter(r => r.status && r.status.toUpperCase() === 'OCCUPIED').forEach(r => {
          const roomNum = String(r.roomNumber);
          if (!this.state.activeRooms.some(ar => String(ar.roomNumber) === roomNum)) {
            this.state.activeRooms.push({
              roomNumber: roomNum,
              guestName: r.guest || 'Active Guest',
              folioId: r.folioId || `FOL-${roomNum}-${Date.now()}`,
              status: 'OCCUPIED',
              checkIn: new Date().toISOString()
            });
            if (!this.state.activeFolios[roomNum]) {
              this.state.activeFolios[roomNum] = [
                { id: `tx-${roomNum}-init`, date: new Date().toISOString(), description: `Room ${roomNum} Lodging Charge`, amount: r.dailyRate || 450.00, departmentCode: 'ROOM', guestName: r.guest || 'Active Guest' }
              ];
            }
          }
        });
        this.save();
      }
    } catch (e) {
      console.warn("Backend state sync warning:", e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  // --- Step 1: Submit Booking Request (Guest Portal) ---
  addBookingRequest(bookingData) {
    const newBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING_APPROVAL',
      dateRequested: new Date().toISOString(),
      ...bookingData
    };
    this.state.pendingBookings = [newBooking, ...this.state.pendingBookings];
    this.save();
    return newBooking;
  }

  // --- Step 2: Approve & Allocate Room (Front Desk) ---
  approveBooking(bookingId, assignedRoomNumber) {
    const booking = this.state.pendingBookings.find(b => b.id === bookingId);
    if (!booking) return null;

    const roomNum = String(assignedRoomNumber);
    const existingOccupant = this.state.activeRooms.find(r => String(r.roomNumber) === roomNum);
    if (existingOccupant) {
      throw new Error(`Suite ${roomNum} is NOT available! It is currently OCCUPIED by ${existingOccupant.guestName} until ${existingOccupant.checkOut || 'check-out'}. Please choose another room.`);
    }

    const folioId = `FOL-${roomNum}-${Date.now().toString().slice(-4)}`;

    // Remove from pending
    this.state.pendingBookings = this.state.pendingBookings.filter(b => b.id !== bookingId);

    // Create occupied active room entry
    const occupiedRoom = {
      roomNumber: roomNum,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      folioId,
      status: 'OCCUPIED',
      checkIn: booking.checkIn || new Date().toISOString().split('T')[0],
      checkOut: booking.checkOut || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      nightlyRate: booking.totalAmount || 450.00
    };

    this.state.activeRooms.push(occupiedRoom);

    // Initialize clean folio ledger for this room with initial Room Charge
    this.state.activeFolios[roomNum] = [
      {
        id: `tx-${roomNum}-lodging`,
        date: new Date().toISOString(),
        description: `Room ${roomNum} Lodging Stay Rate (${booking.requestedRoomType || 'Deluxe Suite'})`,
        amount: Number(booking.totalAmount || 450.00),
        departmentCode: 'ROOM',
        guestName: booking.guestName
      }
    ];

    this.save();
    return occupiedRoom;
  }

  // --- Direct Walk-in Check In (Front Desk Entry - Bypasses Pending Approval) ---
  directCheckIn(guestData) {
    const roomNum = String(guestData.roomNumber);
    const existingOccupant = this.state.activeRooms.find(r => String(r.roomNumber) === roomNum);
    if (existingOccupant) {
      throw new Error(`Suite ${roomNum} is NOT available! It is currently OCCUPIED by ${existingOccupant.guestName} until ${existingOccupant.checkOut || 'check-out'}. Please choose another room.`);
    }

    const folioId = `FOL-${roomNum}-${Date.now().toString().slice(-4)}`;
    const occupiedRoom = {
      roomNumber: roomNum,
      guestName: guestData.guestName,
      guestEmail: guestData.guestEmail || 'walkin@omnistay.com',
      guestPhone: guestData.guestPhone || '+1 (555) 000-0000',
      folioId,
      status: 'OCCUPIED',
      checkIn: guestData.checkIn || new Date().toISOString().split('T')[0],
      checkOut: guestData.checkOut || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      nightlyRate: Number(guestData.nightlyRate || guestData.totalAmount || 450.00)
    };

    this.state.activeRooms.push(occupiedRoom);

    this.state.activeFolios[roomNum] = [
      {
        id: `tx-${roomNum}-lodging`,
        date: new Date().toISOString(),
        description: `Room ${roomNum} Direct Lodging Stay Rate (${guestData.roomType || 'Deluxe Suite'})`,
        amount: Number(guestData.nightlyRate || 450.00),
        departmentCode: 'ROOM',
        guestName: guestData.guestName
      }
    ];

    this.save();
    return occupiedRoom;
  }

  // --- Step 2b: Decline / Reject Booking Request (Front Desk) ---
  declineBooking(bookingId) {
    const bookingIndex = this.state.pendingBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return null;

    const declined = this.state.pendingBookings[bookingIndex];
    this.state.pendingBookings = this.state.pendingBookings.filter(b => b.id !== bookingId);

    this.save();
    return declined;
  }

  // --- Step 3: Add POS Transaction ---
  addTransaction(roomNumber, txn) {
    const key = String(roomNumber);
    const activeRoom = this.state.activeRooms.find(r => String(r.roomNumber) === key);
    
    const newTxn = {
      id: `tx-${key}-${Date.now()}`,
      date: new Date().toISOString(),
      guestName: activeRoom?.guestName || 'Active Guest',
      ...txn
    };

    if (!this.state.activeFolios[key]) this.state.activeFolios[key] = [];
    this.state.activeFolios[key].push(newTxn);

    // Record copy in department POS history log
    const dept = txn.departmentCode || 'F_AND_B';
    if (!this.state.posHistory[dept]) this.state.posHistory[dept] = [];
    this.state.posHistory[dept].unshift({
      ...newTxn,
      roomNumber: key
    });

    this.save();
    return newTxn;
  }

  // --- Step 4: Checkout & Settle Room Folio (Front Desk) ---
  checkoutRoom(roomNumber) {
    const key = String(roomNumber);
    const activeRoomIndex = this.state.activeRooms.findIndex(r => String(r.roomNumber) === key);
    if (activeRoomIndex === -1) return null;

    const activeRoom = this.state.activeRooms[activeRoomIndex];
    const folioTransactions = this.state.activeFolios[key] || [];
    const subtotal = folioTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const taxAmount = subtotal * 0.10; // 10% Hotel Tax
    const grandTotal = subtotal + taxAmount;

    // Create settled stay invoice record
    const settledStayRecord = {
      invoiceId: `INV-${key}-${Date.now().toString().slice(-6)}`,
      roomNumber: key,
      guestName: activeRoom.guestName,
      guestEmail: activeRoom.guestEmail,
      guestPhone: activeRoom.guestPhone,
      folioId: activeRoom.folioId,
      checkIn: activeRoom.checkIn,
      checkOut: new Date().toISOString(),
      subtotal,
      taxAmount,
      grandTotal,
      settledAt: new Date().toISOString(),
      status: 'PAID_AND_SETTLED',
      transactions: [...folioTransactions]
    };

    // Push to master historical archive
    this.state.pastStayHistory.unshift(settledStayRecord);

    // Remove room from active occupied rooms (mark vacant across all POS screens!)
    this.state.activeRooms.splice(activeRoomIndex, 1);
    
    // Clear active folio for this room (POS screens drop this room number!)
    delete this.state.activeFolios[key];

    // Mark suite as DIRTY upon checkout
    if (!this.state.roomStatuses) this.state.roomStatuses = {};
    this.state.roomStatuses[key] = 'DIRTY';

    this.save();
    return settledStayRecord;
  }

  // --- Step 5: Update Room Cleaning Status across all Portals ---
  updateRoomStatus(roomNumber, status) {
    const key = String(roomNumber);
    if (!this.state.roomStatuses) this.state.roomStatuses = {};
    this.state.roomStatuses[key] = status;
    this.save();
    return status;
  }
}

export const folioLedgerStore = new FolioLedgerStore();

export const useFolioLedgers = () => {
  const [state, setState] = useState(folioLedgerStore.state);

  useEffect(() => {
    const unsubscribe = folioLedgerStore.subscribe((updated) => {
      setState({ ...updated });
    });
    return unsubscribe;
  }, []);

  return {
    pendingBookings: state.pendingBookings,
    activeRooms: state.activeRooms,
    activeFolios: state.activeFolios,
    roomStatuses: state.roomStatuses || {},
    pastStayHistory: state.pastStayHistory,
    posHistory: state.posHistory,

    addBookingRequest: (booking) => folioLedgerStore.addBookingRequest(booking),
    approveBooking: (bookingId, roomNumber) => folioLedgerStore.approveBooking(bookingId, roomNumber),
    directCheckIn: (guestData) => folioLedgerStore.directCheckIn(guestData),
    declineBooking: (bookingId) => folioLedgerStore.declineBooking(bookingId),
    addTransaction: (roomNumber, txn) => folioLedgerStore.addTransaction(roomNumber, txn),
    checkoutRoom: (roomNumber) => folioLedgerStore.checkoutRoom(roomNumber),
    updateRoomStatus: (roomNumber, status) => folioLedgerStore.updateRoomStatus(roomNumber, status)
  };
};
