import React, { useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import DatePicker from '../components/DatePicker';
import { useHotelData } from '../services/hotelDataStore';

const FindReservePage = ({ onOpenAuth, onBackToHome }) => {
  const { suites } = useHotelData();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchLocation, setSearchLocation] = useState('Vargarammoota Grand Resort');
  const [checkIn, setCheckIn] = useState('2026-08-20');
  const [checkOut, setCheckOut] = useState('2026-08-25');
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filteredItems = categoryFilter === 'ALL' 
    ? suites 
    : suites.filter(item => item.category === categoryFilter);

  const handleBookNow = (item) => {
    setSelectedSuite(item);
  };

  const handleConfirmReservation = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedSuite(null);
    }, 2500);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* Top Navbar */}
      <nav className="omnistay-navbar">
        <BrandLogo subtitle="CATALOG" onClick={onBackToHome} />

        <div style={{ display: 'flex', gap: '14px' }}>
          <button className="btn-outline-pill" onClick={onBackToHome}>
            ← Back to Home
          </button>
          <button className="btn-primary-azure" onClick={onOpenAuth}>
            Sign In / Register
          </button>
        </div>
      </nav>

      {/* Catalog Header Banner */}
      <div style={{ background: 'var(--bg-dark-slate)', color: '#FFFFFF', padding: '70px 40px 50px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <span className="status-pill blue" style={{ marginBottom: '12px' }}>OmniStay Inventory Catalog</span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '10px', fontFamily: "'Playfair Display', serif" }}>Find & Reserve Your Suite</h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem' }}>
            Explore available luxury suites, private lagoon villas, and wellness amenities with real-time rate verification.
          </p>

          {/* Custom Search Filter Card */}
          <div style={{ background: '#FFFFFF', padding: '24px', marginTop: '32px', color: 'var(--text-main)', display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: '18px', border: '1px solid var(--border-subtle)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Resort / Destination
              </label>
              <select className="form-select-custom" value={searchLocation} onChange={e => setSearchLocation(e.target.value)}>
                <option value="Vargarammoota Grand Resort">Vargarammoota Grand Resort</option>
                <option value="Aman Ocean Residence">Aman Ocean Residence</option>
                <option value="St. Moritz Alpine Chalet">St. Moritz Alpine Chalet</option>
              </select>
            </div>
            <DatePicker 
              label="Check-In Date" 
              value={checkIn} 
              onChange={setCheckIn} 
            />
            <DatePicker 
              label="Check-Out Date" 
              value={checkOut} 
              onChange={setCheckOut} 
              minDate={checkIn}
            />
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Category Filter
              </label>
              <select className="form-select-custom" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="ALL">All Accommodations</option>
                <option value="SUITES">Luxury Suites</option>
                <option value="VILLAS">Lagoon Villas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Items Grid */}
      <div style={{ maxWidth: '1320px', margin: '50px auto 100px', padding: '0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {filteredItems.map(item => (
            <div key={item.id} className="white-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                  <img src={item.image} alt={item.title} className="hover-zoom-img" />
                  <span className="status-pill available" style={{ position: 'absolute', top: '14px', right: '14px' }}>
                    {item.category}
                  </span>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                    {item.capacity} • {item.size}
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.55', marginBottom: '20px' }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {item.amenities && item.amenities.map((a, i) => (
                      <span key={i} style={{ background: 'var(--border-light)', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '4px 10px', fontWeight: 700, border: '1px solid var(--border-subtle)' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: '18px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: "'Playfair Display', serif" }}>${item.price}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / night</span>
                </div>
                <button className="btn-primary-azure" onClick={() => handleBookNow(item)}>
                  Reserve Suite
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Drawer Modal */}
      {selectedSuite && (
        <div className="auth-modal-overlay" onClick={() => setSelectedSuite(null)}>
          <div className="auth-modal-box" onClick={e => e.stopPropagation()} style={{ width: '520px' }}>
            <button 
              className="auth-modal-close-btn"
              onClick={() => setSelectedSuite(null)}
            >
              ✕
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px' }}>Complete Suite Reservation</h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--primary-azure)', fontWeight: 800, marginBottom: '18px' }}>
              {selectedSuite.title} (${selectedSuite.price}/night)
            </div>

            {bookingSuccess ? (
              <div style={{ padding: '24px', background: 'var(--status-available-bg)', border: '1px solid var(--status-available-border)', color: 'var(--primary-azure)', fontWeight: 800, textAlign: 'center' }}>
                Reservation Transmitted & Guest Folio Generated!
              </div>
            ) : (
              <form onSubmit={handleConfirmReservation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase' }}>Guest Full Name</label>
                  <input type="text" required className="form-input-custom" placeholder="Siddharth Kumar" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase' }}>Contact Email or Phone</label>
                  <input type="text" required className="form-input-custom" placeholder="siddharth@gmail.com" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <DatePicker 
                    label="Check-In" 
                    value={checkIn} 
                    onChange={setCheckIn} 
                  />
                  <DatePicker 
                    label="Check-Out" 
                    value={checkOut} 
                    onChange={setCheckOut} 
                    minDate={checkIn}
                  />
                </div>
                <button className="btn-primary-azure" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '10px' }}>
                  Confirm Reservation & Generate Folio
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindReservePage;
