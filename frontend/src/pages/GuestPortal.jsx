import React, { useState } from 'react';
import DatePicker from '../components/DatePicker';
import { useAuth } from '../context/AuthContext';
import { useHotelData } from '../services/hotelDataStore';
import { useFolioLedgers } from '../services/folioLedgerStore';
import BrandLogo from '../components/BrandLogo';
import CustomModal from '../components/CustomModal';

const GuestPortal = ({ onNavigateCatalog, onOpenAuthModal }) => {
  const { logout, userEmail, userPhone, currentUserAccount, updateUserProfile } = useAuth();
  const { diningItems, spaServices } = useHotelData();
  const { pendingBookings, activeRooms, activeFolios, pastStayHistory, addBookingRequest, addTransaction } = useFolioLedgers();

  // Topbar Page Navigation State: DEFAULT TO 'HOME' UPON SIGN-IN
  // Tabs: HOME, FOLIO, DINING, SPA, HOUSEKEEPING, BOOKINGS_HISTORY, REVIEWS
  const [activePage, setActivePage] = useState('HOME');

  // Top-Right Profile Popover Menu State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Profile Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedNameInput, setEditedNameInput] = useState('');

  // Compute exact guest display name (prioritizing user-entered full name or username)
  const resolveGuestDisplayName = () => {
    if (!currentUserAccount) return 'Guest';
    const generic = ['Valued OmniStay Guest', 'Valued Guest', 'OmniStay Guest', 'Guest User'];
    if (currentUserAccount.fullName && !generic.includes(currentUserAccount.fullName.trim())) {
      return currentUserAccount.fullName;
    }
    if (currentUserAccount.username && currentUserAccount.username.toLowerCase() !== 'guest') {
      return currentUserAccount.username;
    }
    if (userEmail && userEmail.includes('@')) {
      return userEmail.split('@')[0];
    }
    return 'Guest';
  };
  const guestDisplayName = resolveGuestDisplayName();

  // Custom Modal Popup State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'ALERT',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null
  });

  const openCustomAlert = (title, message, type = 'WARNING', confirmText = 'UNDERSTAND & CONTINUE', onConfirm = null) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      onConfirm
    });
  };

  const redirectToReservation = () => {
    if (!guestActiveRoom) {
      setActivePage('BOOKINGS_HISTORY');
      showNotification("📅 Please submit a suite reservation request to activate in-room concierge services.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openSignOutConfirm = () => {
    setModalConfig({
      isOpen: true,
      type: 'CONFIRM',
      title: 'Confirm Guest Sign Out',
      message: 'Are you sure you want to sign out of your VIP guest portal session?',
      confirmText: 'Sign Out Now',
      onConfirm: () => logout()
    });
  };

  // Booking Form State
  const [form, setForm] = useState({ 
    name: currentUserAccount?.fullName || currentUserAccount?.username || '', 
    email: currentUserAccount?.email || userEmail || '', 
    phone: currentUserAccount?.phone || userPhone || '', 
    checkIn: new Date().toISOString().split('T')[0], 
    checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], 
    roomType: 'Presidential Ocean Penthouse' 
  });

  React.useEffect(() => {
    if (currentUserAccount) {
      setForm(prev => ({
        ...prev,
        name: currentUserAccount.fullName || currentUserAccount.username || prev.name,
        email: currentUserAccount.email || userEmail || prev.email,
        phone: currentUserAccount.phone || userPhone || prev.phone
      }));
    }
  }, [currentUserAccount, userEmail, userPhone]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Housekeeping State
  const [housekeepingRequests, setHousekeepingRequests] = useState([
    { id: 'hk-1', service: 'Fresh Plush Bath Towels & Linens', time: '10:30 AM', status: 'COMPLETED' }
  ]);
  const [customRequestText, setCustomRequestText] = useState('');

  // Guest Review Submission State
  const [reviewsList, setReviewsList] = useState([
    { id: 'rev-1', guestName: 'Siddharth K.', rating: 5, category: 'Fine Dining & Room Service', text: 'The Truffle Wagyu Ribeye delivered directly to Suite 101 was divine! Impeccable service.', date: '2026-08-18' },
    { id: 'rev-2', guestName: 'Elena Rostova', rating: 5, category: 'Spa & Wellness', text: 'Hydrotherapy mineral pool ritual was so relaxing. Highly recommend the hot stone session!', date: '2026-08-17' }
  ]);
  const [newReviewCategory, setNewReviewCategory] = useState('Fine Dining & Room Service');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewSubmittedMsg, setReviewSubmittedMsg] = useState('');

  // Direct Order / Booking Notification Banner
  const [bannerNotice, setBannerNotice] = useState('');

  // Check if current guest has an active occupied room or pending request
  const guestActiveRoom = activeRooms.find(r => 
    (r.guestEmail && userEmail && r.guestEmail.toLowerCase() === userEmail.toLowerCase()) ||
    (r.guestName && form.name && r.guestName.toLowerCase() === form.name.toLowerCase())
  );

  const guestPendingRequest = pendingBookings.find(b => 
    (b.guestEmail && userEmail && b.guestEmail.toLowerCase() === userEmail.toLowerCase()) ||
    (b.guestName && form.name && b.guestName.toLowerCase() === form.name.toLowerCase())
  );

  const guestPastInvoices = pastStayHistory.filter(h => 
    (h.guestEmail && userEmail && h.guestEmail.toLowerCase() === userEmail.toLowerCase()) ||
    (h.guestName && form.name && h.guestName.toLowerCase() === form.name.toLowerCase())
  );

  const roomNum = guestActiveRoom ? String(guestActiveRoom.roomNumber) : null;
  const currentFolioTxns = roomNum ? (activeFolios[roomNum] || []) : [];
  const currentSubtotal = currentFolioTxns.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const currentTax = currentSubtotal * 0.10;
  const currentGrandTotal = currentSubtotal + currentTax;

  const showNotification = (msg) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(''), 4500);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserAccount) {
      if (onOpenAuthModal) onOpenAuthModal('GUEST');
      return openCustomAlert("Authentication Required", "Please sign in or register your guest account to book a luxury suite.", "WARNING");
    }
    
    setIsSubmitting(true);
    try {
      addBookingRequest({
        guestName: form.name,
        guestEmail: form.email,
        guestPhone: form.phone,
        requestedRoomType: form.roomType,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        totalAmount: 450.00
      });

      setRequestSuccess(true);
      showNotification("✨ Suite Reservation Request Submitted! Front Desk will allocate your room shortly.");
      setTimeout(() => setRequestSuccess(false), 4000);

    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Dining Dish directly to Room Folio
  const handleOrderDiningDish = (dish) => {
    if (!roomNum) {
      openCustomAlert(
        "Active Room Required",
        "⚠️ Active Occupied Room Required: Please check in or wait for Front Desk booking approval to order in-room dining.",
        "WARNING",
        "UNDERSTAND & CONTINUE",
        redirectToReservation
      );
      return;
    }

    addTransaction(roomNum, {
      description: `In-Room Dining: ${dish.name}`,
      amount: dish.price,
      departmentCode: 'F_AND_B',
      guestName: form.name
    });

    showNotification(`🍷 ${dish.name} charged directly to Suite ${roomNum} Folio ($${dish.price.toFixed(2)})`);
  };

  // Book Spa Package directly to Room Folio
  const handleBookSpaPackage = (spa) => {
    if (!roomNum) {
      openCustomAlert(
        "Active Room Required",
        "⚠️ Active Occupied Room Required: Please check in or wait for Front Desk booking approval to book spa services.",
        "WARNING",
        "UNDERSTAND & CONTINUE",
        redirectToReservation
      );
      return;
    }

    addTransaction(roomNum, {
      description: `Spa Treatment: ${spa.title}`,
      amount: spa.price,
      departmentCode: 'SPA',
      guestName: form.name
    });

    showNotification(`🌿 ${spa.title} booked & charged to Suite ${roomNum} Folio ($${spa.price.toFixed(2)})`);
  };

  // Quick Housekeeping Service Tile Dispatch
  const handleQuickHousekeepingDispatch = (serviceName) => {
    if (!roomNum) {
      openCustomAlert(
        "Active Room Required",
        "⚠️ Active Occupied Room Required: Please check in to request housekeeping amenities.",
        "WARNING",
        "UNDERSTAND & CONTINUE",
        redirectToReservation
      );
      return;
    }

    const newReq = {
      id: `hk-${Date.now()}`,
      service: serviceName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'DISPATCHED_TO_ROOM'
    };

    setHousekeepingRequests([newReq, ...housekeepingRequests]);
    showNotification(`🛎️ Housekeeping Request Dispatched: ${serviceName} is on the way to Suite ${roomNum}`);
  };

  const handleCustomHousekeepingSubmit = (e) => {
    e.preventDefault();
    if (!customRequestText) return;
    handleQuickHousekeepingDispatch(customRequestText);
    setCustomRequestText('');
  };

  // Submit Guest Review
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewText) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      guestName: form.name,
      rating: newReviewRating,
      category: newReviewCategory,
      text: newReviewText,
      date: new Date().toISOString().split('T')[0]
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewText('');
    setReviewSubmittedMsg("⭐ Thank you! Your verified guest review has been published.");
    setTimeout(() => setReviewSubmittedMsg(''), 4000);
  };

  // Housekeeping Quick Tiles Data
  const housekeepingAmenities = [
    { title: 'Plush Feather Pillow Menu', desc: 'Hypoallergenic silk & goose feather pillows', icon: '🛏️', category: 'Bedding' },
    { title: 'Fresh Linens & Bath Towels', desc: 'Egyptian cotton 800 GSM luxury bath towels', icon: '🧺', category: 'Linens' },
    { title: 'Turndown & Aromatherapy', desc: 'Evening turndown service with lavender mist', icon: '🌙', category: 'Evening Ritual' },
    { title: 'L’Occitane Bath Amenities', desc: 'Luxury bath gel, shampoo & body moisturizer', icon: '🧴', category: 'Toiletries' },
    { title: 'Luggage Transfer & Butler', desc: 'Express bellhop & luggage storage service', icon: '🧳', category: 'Concierge' },
    { title: 'Express Laundry & Dry Cleaning', desc: 'Same-day garment pressing & dry cleaning', icon: '👔', category: 'Valet' }
  ];

  // If Guest is Not Signed In, show Luxury Sign-In Gateway Card
  if (!currentUserAccount) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="white-card" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '44px 36px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <BrandLogo size="normal" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Guest VIP Concierge Portal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px', lineHeight: '1.6' }}>
            Sign in to access your luxury suite concierge, in-room dining, spa rituals, and active room folio.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button className="btn-primary-azure" style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: '30px' }} onClick={() => onOpenAuthModal && onOpenAuthModal('GUEST')}>
              🔐 Sign In / Register Guest Account
            </button>
            <button className="btn-outline-pill" style={{ borderRadius: '30px' }} onClick={onNavigateCatalog}>
              Explore Suite Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-container" style={{ width: '100%', minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'var(--font-primary)' }}>
      
      {/* ==================== 1. MINIMAL LUXURY TOPBAR HEADER ==================== */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 36px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          
          {/* Left Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BrandLogo size="normal" />
          </div>

          {/* Center Navigation Tabs (PURE TEXT ONLY - NO EMOJIS) */}
          <nav style={{ display: 'flex', gap: '28px', height: '100%', alignItems: 'center' }}>
            {[
              { id: 'HOME', label: 'Home' },
              { id: 'FOLIO', label: 'My Folio' },
              { id: 'DINING', label: 'Dining' },
              { id: 'SPA', label: 'Spa' },
              { id: 'HOUSEKEEPING', label: 'Butler & Services' },
              { id: 'BOOKINGS_HISTORY', label: 'History' },
              { id: 'REVIEWS', label: `Reviews (${reviewsList.length})` }
            ].map((tab) => {
              const isActive = activePage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActivePage(tab.id);
                    setIsProfileMenuOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    height: '100%',
                    padding: '0 4px',
                    fontSize: '0.86rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? 'var(--primary-azure)' : '#475569',
                    borderBottom: isActive ? '2px solid var(--primary-azure)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'var(--primary-azure)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#475569';
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right Profile Section (Square Avatar Button + Top Right Popover) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            
            <button 
              onClick={onNavigateCatalog}
              style={{
                background: 'none',
                border: 'none',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-azure)'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#334155'}
            >
              Reserve Suites →
            </button>

            {/* Square Profile Avatar Button */}
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#0F172A',
                color: '#0084FF',
                border: isProfileMenuOpen ? '2px solid var(--primary-azure)' : '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(15,23,42,0.15)'
              }}
              title="Guest Account Options"
            >
              {guestDisplayName.charAt(0).toUpperCase()}
            </button>

            {/* Top Right Profile Popover Popup */}
            {isProfileMenuOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '64px',
                  right: '36px',
                  width: '300px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
                  padding: '20px',
                  zIndex: 200,
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                {/* Popover Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid #E2E8F0', marginBottom: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#0F172A', color: '#0084FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>
                    {guestDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    {isEditingName ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input-custom"
                          style={{ padding: '4px 8px', fontSize: '0.82rem', height: '28px', borderRadius: '6px' }}
                          value={editedNameInput}
                          onChange={(e) => setEditedNameInput(e.target.value)}
                          placeholder="Enter display name"
                          autoFocus
                        />
                        <button
                          style={{ background: 'var(--primary-azure)', color: '#FFF', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                          onClick={() => {
                            if (editedNameInput.trim()) {
                              updateUserProfile({ fullName: editedNameInput.trim() });
                            }
                            setIsEditingName(false);
                          }}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {guestDisplayName}
                        </div>
                        <button
                          style={{ background: 'none', border: 'none', color: 'var(--primary-azure)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 800, padding: 0 }}
                          onClick={() => {
                            setEditedNameInput(guestDisplayName);
                            setIsEditingName(true);
                          }}
                          title="Edit Display Name"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    )}
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-azure)', background: '#F0F9FF', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginTop: '2px' }}>
                      VIP Executive Member
                    </span>
                  </div>
                </div>

                {/* Account Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B' }}>Account ID:</span>
                    <strong style={{ color: '#0F172A', fontSize: '0.74rem', fontFamily: 'monospace', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={currentUserAccount?.accountId}>
                      {currentUserAccount?.accountId || 'N/A'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Username:</span>
                    <strong style={{ color: '#0F172A' }}>{currentUserAccount?.username || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Email:</span>
                    <strong style={{ color: '#0F172A', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentUserAccount?.email || 'Not provided'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Phone:</span>
                    <strong style={{ color: '#0F172A' }}>{currentUserAccount?.phone || 'Not provided'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Active Suite:</span>
                    <strong style={{ color: 'var(--primary-azure)' }}>{roomNum ? `Suite ${roomNum}` : 'None'}</strong>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      setActivePage('BOOKINGS_HISTORY');
                      setIsProfileMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      padding: '9px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    View Stay Receipts & History
                  </button>

                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      openSignOutConfirm();
                    }}
                    style={{
                      width: '100%',
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      padding: '9px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: '#DC2626',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    Sign Out Account
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>
      </header>

      {/* Global Toast Notification */}
      {bannerNotice && (
        <div style={{ background: '#0F172A', color: '#38BDF8', borderBottom: '2px solid var(--primary-azure)', padding: '12px 24px', textAlign: 'center', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.3px' }}>
          {bannerNotice}
        </div>
      )}

      {/* ==================== 2. PAGE 1: DEFAULT APP WELCOME HOME SCREEN (HOME) ==================== */}
      {activePage === 'HOME' && (
        <main style={{ maxWidth: '1440px', margin: '32px auto', padding: '0 36px' }}>
          
          {/* Grand App Welcome Hero Section */}
          <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', padding: '48px 56px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '40px', alignItems: 'center' }}>
            <div>
              <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '16px', display: 'inline-block' }}>
                Thank You For Staying With OmniStay Luxury Resorts
              </span>
              <h1 style={{ fontSize: '2.6rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", margin: '0 0 12px 0', letterSpacing: '-0.5px', lineHeight: '1.2', color: '#FFFFFF' }}>
                Welcome to Your Private Concierge Sanctuary, {guestDisplayName}!
              </h1>
              <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: '0 0 28px 0', lineHeight: '1.6', maxWidth: '640px' }}>
                We are delighted to host you. Explore our Michelin-inspired in-room dining, hydrotherapy wellness rituals, 24/7 personal butler services, and live room folio management directly from your guest application.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button 
                  className="btn-primary-azure" 
                  style={{ padding: '14px 28px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 800 }}
                  onClick={() => setActivePage('DINING')}
                >
                  Order In-Room Dining &rarr;
                </button>
                <button 
                  className="btn-outline-pill" 
                  style={{ padding: '14px 28px', borderRadius: '30px', fontSize: '0.85rem', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)' }}
                  onClick={() => setActivePage('FOLIO')}
                >
                  View Room Folio Bill
                </button>
                <button 
                  className="btn-outline-pill" 
                  style={{ padding: '14px 28px', borderRadius: '30px', fontSize: '0.85rem', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)' }}
                  onClick={() => setActivePage('HOUSEKEEPING')}
                >
                  Housekeeping Amenities
                </button>
              </div>
            </div>

            {/* Live Stay Card */}
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', padding: '28px 32px', borderRadius: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>
                Live Stay Status & Folio Balance
              </div>
              
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#38BDF8', margin: '10px 0 4px 0' }}>
                ${currentGrandTotal.toFixed(2)}
              </div>

              <div style={{ fontSize: '0.85rem', color: '#E2E8F0', fontWeight: 700, marginBottom: '16px' }}>
                {roomNum ? `Checked-In: Suite ${roomNum}` : guestPendingRequest ? 'Booking Under Review' : 'No Active Stay Checked-In'}
              </div>

              <button 
                className="btn-primary-azure" 
                style={{ width: '100%', padding: '10px', borderRadius: '20px', fontSize: '0.82rem', justifyContent: 'center' }}
                onClick={() => setActivePage(roomNum ? 'FOLIO' : 'BOOKINGS_HISTORY')}
              >
                {roomNum ? 'View Itemized Folio →' : 'Reserve Luxury Suite →'}
              </button>
            </div>
          </div>

          {/* Quick Concierge Feature Showcase Grid */}
          <div style={{ margin: '40px 0 20px 0' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.3px' }}>
              Resort Experience & Concierge Offerings
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 24px 0' }}>
              Tap any tile to access dedicated guest services and order directly to your room folio.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              
              {/* Tile 1: Fine Dining */}
              <div 
                className="white-card" 
                style={{ borderRadius: '20px', padding: 0, overflow: 'hidden', cursor: 'pointer', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                onClick={() => setActivePage('DINING')}
              >
                <div style={{ height: '170px', overflow: 'hidden' }}>
                  <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" alt="Dining" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <span className="status-pill blue" style={{ fontSize: '0.68rem', marginBottom: '6px' }}>Gourmet Cuisine</span>
                  <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif" }}>Azure Michelin In-Room Dining</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                    Truffle Wagyu, Caviar, and Dom Pérignon delivered directly to your suite.
                  </p>
                </div>
              </div>

              {/* Tile 2: Spa */}
              <div 
                className="white-card" 
                style={{ borderRadius: '20px', padding: 0, overflow: 'hidden', cursor: 'pointer', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                onClick={() => setActivePage('SPA')}
              >
                <div style={{ height: '170px', overflow: 'hidden' }}>
                  <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80" alt="Spa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <span className="status-pill blue" style={{ fontSize: '0.68rem', marginBottom: '6px' }}>Hydrotherapy</span>
                  <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif" }}>Mineral Spa & Wellness Rituals</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                    Hot stone massages, aromatherapy facials, and private infinity pools.
                  </p>
                </div>
              </div>

              {/* Tile 3: Butler Services */}
              <div 
                className="white-card" 
                style={{ borderRadius: '20px', padding: 0, overflow: 'hidden', cursor: 'pointer', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                onClick={() => setActivePage('HOUSEKEEPING')}
              >
                <div style={{ height: '170px', overflow: 'hidden' }}>
                  <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80" alt="Butler" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <span className="status-pill blue" style={{ fontSize: '0.68rem', marginBottom: '6px' }}>24/7 Butler</span>
                  <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif" }}>In-Room Housekeeping Amenities</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                    Plush pillow menus, fresh Egyptian towels, turndown lavender mist, and valet pressing.
                  </p>
                </div>
              </div>

              {/* Tile 4: Bookings & History */}
              <div 
                className="white-card" 
                style={{ borderRadius: '20px', padding: 0, overflow: 'hidden', cursor: 'pointer', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                onClick={() => setActivePage('BOOKINGS_HISTORY')}
              >
                <div style={{ height: '170px', overflow: 'hidden' }}>
                  <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" alt="Resort" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <span className="status-pill blue" style={{ fontSize: '0.68rem', marginBottom: '6px' }}>Luxury Suites</span>
                  <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif" }}>Suite Bookings & Past Receipts</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                    Reserve ocean penthouses and view past settled stay invoices with downloadable receipts.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </main>
      )}

      {/* ==================== 3. PAGE 2: FOCUSED MY FOLIO & BILL PAGE (FOLIO) ==================== */}
      {activePage === 'FOLIO' && (
        <main style={{ maxWidth: '1440px', margin: '32px auto', padding: '0 36px' }}>
          
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span className="status-pill blue" style={{ marginBottom: '8px', display: 'inline-block' }}>Live Room Folio Statement</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                Itemized Room Charges & Statement
              </h2>
            </div>
            {roomNum && (
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-azure)', background: '#F0F9FF', padding: '8px 18px', borderRadius: '20px' }}>
                Suite {roomNum} • Checked-In
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
            
            {/* Left: Itemized Charges Table */}
            <div className="white-card" style={{ borderRadius: '20px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A' }}>
                  Line Item Charges {roomNum ? `(Suite ${roomNum})` : ''}
                </h3>
                <span className="status-pill blue" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                  {currentFolioTxns.length} Line Items
                </span>
              </div>

              {!guestActiveRoom ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                  {guestPendingRequest ? (
                    <div>
                      <h4 style={{ color: '#B45309', margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                        Reservation Under Review
                      </h4>
                      <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#475569' }}>
                        Your requested suite (<strong>{guestPendingRequest.requestedRoomType}</strong>) is currently being approved by Front Desk.<br />
                        Your itemized room folio will populate automatically upon room allocation!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A' }}>
                        No Active Room Checked In
                      </h4>
                      <p style={{ margin: '0 0 20px 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        Reserve your luxury suite to activate your in-room concierge and live folio.
                      </p>
                      <button className="btn-primary-azure" style={{ borderRadius: '30px', padding: '12px 24px' }} onClick={() => setActivePage('BOOKINGS_HISTORY')}>
                        Reserve Luxury Suite Now
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="modern-table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Dept</th>
                        <th>Description</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentFolioTxns.map((txn) => (
                        <tr key={txn.id}>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            <span className="status-pill blue" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                              {txn.departmentCode}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>{txn.description}</td>
                          <td style={{ textAlign: 'right', fontWeight: 900, color: 'var(--primary-azure)', fontSize: '0.95rem' }}>
                            +${Number(txn.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right: Bill Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="white-card" style={{ borderRadius: '20px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A' }}>
                  Statement Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal Charges:</span>
                    <strong style={{ color: '#0F172A' }}>${currentSubtotal.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Resort Luxury Tax (10%):</span>
                    <strong style={{ color: '#0F172A' }}>${currentTax.toFixed(2)}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-azure)' }}>
                  <span>Grand Total:</span>
                  <span>${currentGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Quick Order Shortcut */}
              <div className="white-card" style={{ borderRadius: '20px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A' }}>
                  Order Services to Folio
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={() => setActivePage('DINING')} 
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '14px 18px', 
                      background: '#FFFFFF', 
                      border: '1px solid #E2E8F0', 
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease', 
                      textAlign: 'left' 
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-azure)'; e.currentTarget.style.background = '#F0F9FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>Order In-Room Dining</span>
                    <span style={{ color: 'var(--primary-azure)', fontWeight: 800, fontSize: '0.82rem' }}>Explore &rarr;</span>
                  </button>
                  <button 
                    onClick={() => setActivePage('SPA')} 
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '14px 18px', 
                      background: '#FFFFFF', 
                      border: '1px solid #E2E8F0', 
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease', 
                      textAlign: 'left' 
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-azure)'; e.currentTarget.style.background = '#F0F9FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>Book Spa Treatment</span>
                    <span style={{ color: 'var(--primary-azure)', fontWeight: 800, fontSize: '0.82rem' }}>Book &rarr;</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      )}

      {/* ==================== 4. PAGE 3: CULINARY DINING ==================== */}
      {activePage === 'DINING' && (
        <main style={{ maxWidth: '1440px', margin: '32px auto', padding: '0 36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
            <div>
              <span className="status-pill blue" style={{ marginBottom: '8px', display: 'inline-block' }}>In-Room Gourmet Dining</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                Azure Michelin-Inspired Culinary Menu
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Select handcrafted dishes to be delivered directly to your suite and billed to your room folio.
              </p>
            </div>
            {roomNum && (
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-azure)', background: '#F0F9FF', padding: '8px 16px', borderRadius: '20px' }}>
                Delivering to: Suite {roomNum}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {diningItems.map(dish => (
              <div key={dish.id} className="white-card" style={{ padding: 0, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '200px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  <img src={dish.image} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px' }}>
                    {dish.category}
                  </span>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A' }}>{dish.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>{dish.description}</p>
                </div>
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: 'auto' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary-azure)' }}>${dish.price.toFixed(2)}</span>
                  <button className="btn-primary-azure" style={{ borderRadius: '30px', padding: '8px 18px', fontSize: '0.8rem' }} onClick={() => handleOrderDiningDish(dish)}>
                    + Order to Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ==================== 5. PAGE 4: SPA & WELLNESS ==================== */}
      {activePage === 'SPA' && (
        <main style={{ maxWidth: '1440px', margin: '32px auto', padding: '0 36px' }}>
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
            <span className="status-pill blue" style={{ marginBottom: '8px', display: 'inline-block' }}>Hydrotherapy & Mineral Spa</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
              Wellness Rituals & Spa Sanctuaries
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Reserve hot stone massages, aromatherapy facials, and private hydrotherapy sessions billed directly to your folio.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
            {spaServices.map(spa => (
              <div key={spa.id} className="white-card" style={{ padding: 0, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  <img src={spa.image} alt={spa.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', color: '#38BDF8', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px' }}>
                    {spa.duration}
                  </span>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A' }}>{spa.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>{spa.description}</p>
                </div>
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: 'auto' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary-azure)' }}>${spa.price.toFixed(2)}</span>
                  <button className="btn-primary-azure" style={{ borderRadius: '30px', padding: '8px 18px', fontSize: '0.8rem' }} onClick={() => handleBookSpaPackage(spa)}>
                    + Book Spa Ritual
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ==================== 6. PAGE 5: HOUSEKEEPING & AMENITIES ==================== */}
      {activePage === 'HOUSEKEEPING' && (
        <main style={{ maxWidth: '1440px', margin: '32px auto', padding: '0 36px' }}>
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
            <span className="status-pill blue" style={{ marginBottom: '8px', display: 'inline-block' }}>24/7 Butler & Housekeeping Concierge</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
              In-Room Housekeeping Amenities & Service Requests
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select 1-click room amenity dispatches or write a custom request to your assigned butler staff.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {housekeepingAmenities.map((item, idx) => (
              <div key={idx} className="white-card" style={{ borderRadius: '18px', padding: '24px', cursor: 'pointer', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} onClick={() => handleQuickHousekeepingDispatch(item.title)}>
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary-azure)', background: '#F0F9FF', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', marginBottom: '8px' }}>{item.category}</span>
                  <h3 style={{ margin: '4px 0 4px 0', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>{item.desc}</p>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-outline-pill" style={{ borderRadius: '20px', fontSize: '0.75rem', padding: '6px 14px', color: 'var(--primary-azure)' }}>
                    Dispatch to Suite &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
            <div className="white-card" style={{ borderRadius: '20px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A' }}>
                Write Custom Butler Request
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Need something specific? Send an instant ticket directly to Front Desk & Housekeeping.
              </p>
              <form onSubmit={handleCustomHousekeepingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <textarea required rows={4} className="form-input-custom" style={{ borderRadius: '12px', padding: '14px' }} placeholder="e.g. Please send extra champagne flutes and ice bucket to Suite 101." value={customRequestText} onChange={e => setCustomRequestText(e.target.value)} />
                <button className="btn-primary-azure" style={{ borderRadius: '30px', padding: '12px', justifyContent: 'center' }}>
                  Transmit Request to Staff
                </button>
              </form>
            </div>

            <div className="white-card" style={{ borderRadius: '20px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A' }}>
                Transmitted Housekeeping Logs
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                {housekeepingRequests.map(req => (
                  <div key={req.id} style={{ padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>{req.service}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Requested at {req.time}</div>
                    </div>
                    <span className="status-pill available" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>{req.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ==================== 7. PAGE 6: BOOKINGS & STAY HISTORY ==================== */}
      {activePage === 'BOOKINGS_HISTORY' && (
        <main style={{ maxWidth: '1440px', margin: '32px auto', padding: '0 36px' }}>
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
            <span className="status-pill blue" style={{ marginBottom: '8px', display: 'inline-block' }}>Stay History & Direct Reservation</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
              My Reservations & Past Stay Invoices
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
            <div className="white-card" style={{ borderRadius: '20px', padding: '28px' }}>
              <h3 style={{ color: '#0F172A', marginBottom: '6px', fontSize: '1.3rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                Reserve New Luxury Suite
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Profile Bound: <strong>{guestDisplayName} ({userEmail})</strong>
              </p>

              {requestSuccess && (
                <div style={{ padding: '14px', marginBottom: '16px', background: 'var(--status-available-bg)', border: '1px solid var(--status-available-border)', color: 'var(--primary-azure)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800 }}>
                  Booking Request Transmitted to Front Desk!
                </div>
              )}

              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Guest Full Name</label>
                  <input type="text" required className="form-input-custom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Email</label>
                    <input type="email" required className="form-input-custom" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Phone</label>
                    <input type="tel" required className="form-input-custom" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Select Accommodation Suite</label>
                  <select className="form-select-custom" value={form.roomType} onChange={e => setForm({...form, roomType: e.target.value})}>
                    <option value="Presidential Ocean Penthouse">Presidential Ocean Penthouse ($850/night)</option>
                    <option value="Executive Sunset Lagoon Villa">Executive Sunset Lagoon Villa ($520/night)</option>
                    <option value="Grand Deluxe King Suite">Grand Deluxe King Suite ($340/night)</option>
                    <option value="Royal Horizon Sanctuary">Royal Horizon Sanctuary ($680/night)</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <DatePicker label="Check-in Date" value={form.checkIn} onChange={val => setForm({...form, checkIn: val})} />
                  <DatePicker label="Check-out Date" value={form.checkOut} onChange={val => setForm({...form, checkOut: val})} minDate={form.checkIn} />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary-azure" 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: '30px', marginTop: '6px' }} 
                  disabled={isSubmitting || guestActiveRoom}
                >
                  {isSubmitting ? 'Transmitting Request...' : guestActiveRoom ? 'Already Checked In (Room Occupied)' : 'Submit Booking Request to Front Desk'}
                </button>
              </form>
            </div>

            <div className="white-card" style={{ borderRadius: '20px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A' }}>
                Past Stay Receipts & Invoices
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {guestPastInvoices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No completed past stays found. Settled bills upon checkout will archive here.
                  </div>
                ) : (
                  guestPastInvoices.map(inv => (
                    <div key={inv.invoiceId} style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>Invoice #{inv.invoiceId}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Suite {inv.roomNumber} • Checked out {new Date(inv.settledAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="status-pill available" style={{ fontSize: '0.68rem', marginBottom: '2px', display: 'inline-block' }}>SETTLED</span>
                        <div style={{ fontWeight: 900, color: 'var(--primary-azure)', fontSize: '1.1rem' }}>
                          ${inv.grandTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ==================== 8. PAGE 7: GUEST REVIEWS & RATINGS ==================== */}
      {activePage === 'REVIEWS' && (
        <main style={{ maxWidth: '1440px', margin: '32px auto', padding: '0 36px' }}>
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
            <span className="status-pill blue" style={{ marginBottom: '8px', display: 'inline-block' }}>Verified Guest Feedback</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
              Guest Reviews & Experience Ratings
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Share feedback regarding your in-room dining, spa rituals, or overall resort stay.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '28px' }}>
            <div className="white-card" style={{ borderRadius: '20px', padding: '28px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: '#0F172A' }}>
                Submit Guest Review
              </h3>
              {reviewSubmittedMsg && (
                <div style={{ padding: '12px', marginBottom: '14px', background: 'var(--status-available-bg)', border: '1px solid var(--status-available-border)', color: 'var(--primary-azure)', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem' }}>
                  {reviewSubmittedMsg}
                </div>
              )}
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Category</label>
                  <select className="form-select-custom" value={newReviewCategory} onChange={e => setNewReviewCategory(e.target.value)}>
                    <option value="Fine Dining & Room Service">Fine Dining & In-Room Service</option>
                    <option value="Spa & Wellness">Spa & Wellness Rituals</option>
                    <option value="Housekeeping & Suite Comfort">Housekeeping & Suite Comfort</option>
                    <option value="Overall Resort Stay">Overall Resort Experience</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Star Rating</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(num => (
                      <button key={num} type="button" onClick={() => setNewReviewRating(num)} style={{ flex: 1, padding: '8px', border: newReviewRating === num ? '2px solid var(--primary-azure)' : '1px solid #E2E8F0', background: newReviewRating === num ? '#F0F9FF' : '#FFFFFF', borderRadius: '8px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', color: '#F59E0B' }}>
                        {num} ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Review Feedback</label>
                  <textarea required rows={4} className="form-input-custom" style={{ borderRadius: '12px', padding: '12px' }} placeholder="Write your review comments..." value={newReviewText} onChange={e => setNewReviewText(e.target.value)} />
                </div>
                <button className="btn-primary-azure" style={{ borderRadius: '30px', padding: '12px', justifyContent: 'center' }}>
                  Post Review
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviewsList.map(rev => (
                <div key={rev.id} className="white-card" style={{ borderRadius: '18px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>{rev.guestName}</div>
                    <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: '1rem' }}>{'★'.repeat(rev.rating)}</span>
                  </div>
                  <span className="status-pill blue" style={{ fontSize: '0.68rem', marginBottom: '10px', display: 'inline-block' }}>{rev.category}</span>
                  <p style={{ margin: '6px 0 10px 0', fontSize: '0.88rem', color: '#334155', lineHeight: '1.5' }}>"{rev.text}"</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>Published on {rev.date}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Custom Theme-Matching Modal Popup */}
      <CustomModal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />

    </div>
  );
};

export default GuestPortal;