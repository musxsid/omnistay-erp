import { useState, useEffect } from 'react';
import { apiFetch } from './apiClient';

class FolioLedgerStore {
  constructor() {
    this.listeners = new Set();
    this.state = {
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
      activeRooms: [],
      activeFolios: {},
      roomStatuses: {
        "103": "DIRTY",
        "106": "DIRTY",
        "205": "DIRTY"
      },
      pastStayHistory: [],
      posHistory: {
        F_AND_B: [],
        HOUSEKEEPING: [],
        SPA: []
      }
    };

    // Synchronize initial state with PostgreSQL database
    this.syncWithPostgres();
  }

  async syncWithPostgres() {
    try {
      // 1. Fetch pending bookings from PostgreSQL
      const bookingsFromDb = await apiFetch('/api/bookings').catch(() => null);
      if (bookingsFromDb && Array.isArray(bookingsFromDb)) {
        this.state.pendingBookings = bookingsFromDb;
      }

      // 2. Fetch occupied active rooms from PostgreSQL
      const occupiedRoomsFromDb = await apiFetch('/api/rooms/matrix').catch(() => null);
      if (occupiedRoomsFromDb && Array.isArray(occupiedRoomsFromDb)) {
        this.state.activeRooms = occupiedRoomsFromDb;

        // Fetch active folios for each occupied room
        for (const room of occupiedRoomsFromDb) {
          const roomNum = String(room.roomNumber);
          const foliosFromDb = await apiFetch(`/api/folios/${roomNum}`).catch(() => null);
          if (foliosFromDb && Array.isArray(foliosFromDb)) {
            this.state.activeFolios[roomNum] = foliosFromDb;
          }
        }
      }

      // 3. Fetch settled invoices history from PostgreSQL
      const invoicesFromDb = await apiFetch('/api/invoices').catch(() => null);
      if (invoicesFromDb && Array.isArray(invoicesFromDb)) {
        this.state.pastStayHistory = invoicesFromDb;
      }

      this.notify();
    } catch (e) {
      console.warn("PostgreSQL state sync warning:", e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  // --- 1. Submit Booking Request (PostgreSQL) ---
  async addBookingRequest(bookingData) {
    const bookingPayload = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: bookingData.guestName,
      guestEmail: bookingData.guestEmail,
      guestPhone: bookingData.guestPhone,
      requestedRoomType: bookingData.requestedRoomType,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      status: 'PENDING_APPROVAL',
      totalAmount: Number(bookingData.totalAmount || 850.00)
    };

    // Optimistic UI update
    this.state.pendingBookings = [bookingPayload, ...this.state.pendingBookings];
    this.notify();

    try {
      await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingPayload)
      });
      await this.syncWithPostgres();
    } catch (e) {
      console.warn("Failed to persist booking to PostgreSQL:", e);
    }

    return bookingPayload;
  }

  // --- 2. Approve Booking & Allocate Room (PostgreSQL) ---
  async approveBooking(bookingId, assignedRoomNumber) {
    const roomNum = String(assignedRoomNumber);
    const existingOccupant = this.state.activeRooms.find(r => String(r.roomNumber) === roomNum);
    if (existingOccupant) {
      throw new Error(`Suite ${roomNum} is NOT available! It is currently OCCUPIED by ${existingOccupant.guestName}.`);
    }

    try {
      await apiFetch(`/api/bookings/${bookingId}/approve?roomNumber=${roomNum}`, {
        method: 'POST'
      });
      await this.syncWithPostgres();
    } catch (e) {
      console.warn("Booking approval via PostgreSQL failed, falling back locally:", e);
      // Fallback local update
      const booking = this.state.pendingBookings.find(b => b.id === bookingId);
      if (booking) {
        this.state.pendingBookings = this.state.pendingBookings.filter(b => b.id !== bookingId);
        const occupiedRoom = {
          roomNumber: roomNum,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone,
          folioId: `FOL-${roomNum}-${Date.now().toString().slice(-4)}`,
          status: 'OCCUPIED',
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nightlyRate: booking.totalAmount || 450.00
        };
        this.state.activeRooms.push(occupiedRoom);
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
        this.notify();
      }
    }
  }

  // --- Direct Walk-in Check In ---
  async directCheckIn(guestData) {
    const roomNum = String(guestData.roomNumber);
    const existingOccupant = this.state.activeRooms.find(r => String(r.roomNumber) === roomNum);
    if (existingOccupant) {
      throw new Error(`Suite ${roomNum} is NOT available! It is currently OCCUPIED.`);
    }

    const bookingPayload = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: guestData.guestName,
      guestEmail: guestData.guestEmail || 'walkin@omnistay.com',
      guestPhone: guestData.guestPhone || '+1 (555) 000-0000',
      requestedRoomType: guestData.roomType || 'Deluxe Suite',
      checkIn: guestData.checkIn || new Date().toISOString().split('T')[0],
      checkOut: guestData.checkOut || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      status: 'PENDING_APPROVAL',
      totalAmount: Number(guestData.nightlyRate || 450.00)
    };

    try {
      const createdBooking = await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingPayload)
      });
      await this.approveBooking(createdBooking.id || bookingPayload.id, roomNum);
    } catch (e) {
      console.warn("Direct check in fallback:", e);
    }
  }

  // --- Decline Booking Request ---
  declineBooking(bookingId) {
    this.state.pendingBookings = this.state.pendingBookings.filter(b => b.id !== bookingId);
    this.notify();
  }

  // --- Add POS Transaction (PostgreSQL) ---
  async addTransaction(roomNumber, txn) {
    const key = String(roomNumber);
    const activeRoom = this.state.activeRooms.find(r => String(r.roomNumber) === key);

    const newTxn = {
      id: `tx-${key}-${Date.now()}`,
      roomNumber: key,
      transactionDate: new Date().toISOString(),
      description: txn.description,
      amount: Number(txn.amount),
      departmentCode: txn.departmentCode || 'F_AND_B',
      guestName: activeRoom?.guestName || 'Active Guest'
    };

    if (!this.state.activeFolios[key]) this.state.activeFolios[key] = [];
    this.state.activeFolios[key].push(newTxn);

    const dept = txn.departmentCode || 'F_AND_B';
    if (!this.state.posHistory[dept]) this.state.posHistory[dept] = [];
    this.state.posHistory[dept].unshift(newTxn);

    this.notify();

    try {
      await apiFetch(`/api/folios/${key}/transactions`, {
        method: 'POST',
        body: JSON.stringify(newTxn)
      });
    } catch (e) {
      console.warn("PostgreSQL transaction save warning:", e);
    }

    return newTxn;
  }

  // --- Checkout & Settle Room Folio (PostgreSQL) ---
  async checkoutRoom(roomNumber) {
    const key = String(roomNumber);
    const activeRoomIndex = this.state.activeRooms.findIndex(r => String(r.roomNumber) === key);
    if (activeRoomIndex === -1) return null;

    try {
      const settledInvoice = await apiFetch(`/api/folios/${key}/checkout`, {
        method: 'POST'
      });
      await this.syncWithPostgres();
      return settledInvoice;
    } catch (e) {
      console.warn("PostgreSQL checkout failed, falling back locally:", e);
      const activeRoom = this.state.activeRooms[activeRoomIndex];
      const folioTransactions = this.state.activeFolios[key] || [];
      const subtotal = folioTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const taxAmount = subtotal * 0.10;
      const grandTotal = subtotal + taxAmount;

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

      this.state.pastStayHistory.unshift(settledStayRecord);
      this.state.activeRooms.splice(activeRoomIndex, 1);
      delete this.state.activeFolios[key];
      if (!this.state.roomStatuses) this.state.roomStatuses = {};
      this.state.roomStatuses[key] = 'DIRTY';
      this.notify();

      return settledStayRecord;
    }
  }

  // --- Update Room Cleaning Status (PostgreSQL) ---
  async updateRoomStatus(roomNumber, status) {
    const key = String(roomNumber);
    if (!this.state.roomStatuses) this.state.roomStatuses = {};
    this.state.roomStatuses[key] = status;
    this.notify();

    try {
      await apiFetch(`/api/rooms/${key}/status?status=${status}`, {
        method: 'PUT'
      });
    } catch (e) {
      console.warn("Update room status in PostgreSQL warning:", e);
    }
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
