import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({
    totalCount: 146,
    integrations: 8,
    occupiedRooms: 3,
    activeReservations: 12,
    grossRevenue: 49585038,
    routes: {
      "GET /api/rooms": 42,
      "GET /api/v1/guests": 51,
      "POST /api/v1/ai/analyze-review": 8,
      "POST /api/v1/billing/invoice": 45
    }
  });
  
  const [rooms, setRooms] = useState([
    { roomId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", roomNumber: 101, roomType: "Presidential", dailyRate: 600.00, status: "AVAILABLE" },
    { roomId: "1c9d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f", roomNumber: 102, roomType: "Deluxe King", dailyRate: 250.00, status: "OCCUPIED" },
    { roomId: "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b", roomNumber: 201, roomType: "Executive Double", dailyRate: 180.00, status: "DIRTY" },
    { roomId: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d", roomNumber: 202, roomType: "Standard Single", dailyRate: 120.00, status: "AVAILABLE" },
    { roomId: "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b", roomNumber: 305, roomType: "Penthouse Suite", dailyRate: 850.00, status: "MAINTENANCE" }
  ]);

  const [guests, setGuests] = useState([
    { guestId: "4f3b202a-3a1b-4c5d-9e8f-7a6b5c4d3e2f", fullName: "Aaron Sharma", email: "aaron.sharma@gmail.com", phone: "+919876543210", address: "12 Park Street, New Delhi, India" },
    { guestId: "8f3b202a-3a1b-4c5d-9e8f-7a6b5c4d3e2f", fullName: "Aditi Patel", email: "aditi.patel@yahoo.com", phone: "+919123456789", address: "45 Marine Drive, Mumbai, India" },
    { guestId: "9a4c313b-4b2c-5d6e-0f9a-8b7c6d5e4f3g", fullName: "John Smith", email: "john.smith@omnistay.uk", phone: "+447123456789", address: "22 Baker St, London, UK" }
  ]);

  const [bookingForm, setBookingForm] = useState({ guestName: '', guestEmail: '', selectedRoom: 101, checkIn: '', checkOut: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const syncTelemetryMetrics = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/metrics');
      if (res.ok) {
        const data = await res.json();
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        setMetrics(prev => ({ ...prev, totalCount: total, routes: data }));
      }
    } catch (err) {}
  };

  const executeFeedbackAnalysis = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setLoadingAi(true);
    setAiResult(null);

    try {
      const res = await fetch('http://localhost:8080/api/v1/ai/analyze-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: reviewText })
      });
      const data = await res.json();
      setAiResult(data);
      
      setMetrics(prev => {
        const updatedRoutes = { ...prev.routes };
        updatedRoutes["POST /api/v1/ai/analyze-review"] = (updatedRoutes["POST /api/v1/ai/analyze-review"] || 0) + 1;
        return {
          ...prev,
          totalCount: prev.totalCount + 1,
          routes: updatedRoutes
        };
      });
    } catch (err) {
      setAiResult({ status: 'ERROR', aiAnalysisReport: 'Failed to communicate with API.' });
    } finally {
      setLoadingAi(false);
    }
  };

  const processPublicBooking = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setRooms(rooms.map(r => r.roomNumber === parseInt(bookingForm.selectedRoom) ? { ...r, status: 'OCCUPIED' } : r));
    
    setMetrics(prev => ({
      ...prev,
      totalCount: prev.totalCount + 1,
      activeReservations: prev.activeReservations + 1,
      grossRevenue: prev.grossRevenue + rooms.find(r => r.roomNumber === parseInt(bookingForm.selectedRoom)).dailyRate
    }));

    setTimeout(() => {
      setBookingSuccess(false);
      setBookingForm({ guestName: '', guestEmail: '', selectedRoom: 101, checkIn: '', checkOut: '' });
    }, 3000);
  };

  return (
    <DataContext.Provider value={{
      metrics, rooms, guests, bookingForm, setBookingForm, bookingSuccess,
      reviewText, setReviewText, aiResult, loadingAi,
      syncTelemetryMetrics, executeFeedbackAnalysis, processPublicBooking
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);