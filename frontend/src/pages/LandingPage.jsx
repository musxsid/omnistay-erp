import React, { useState, useEffect, useRef } from 'react';
import BrandLogo from '../components/BrandLogo';
import DatePicker from '../components/DatePicker';
import { useHotelData } from '../services/hotelDataStore';

// Hero Background Image Slideshow (Auto-Rotating with Smooth Crossfade)
const heroBackgroundImages = [
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
    title: 'Vargarammoota Tropical Resort Pool & Limestone Mountain'
  },
  {
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80',
    title: 'Oceanfront Deck & Sunset Infinity Pool'
  },
  {
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80',
    title: 'Grand White Palace Resort & Reflecting Pool'
  },
  {
    url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1920&q=80',
    title: 'Illuminated Evening Pool & Royal Palm Gardens'
  },
  {
    url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80',
    title: 'Aerial Coastal Estate & Winding Lagoon Pools'
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80',
    title: 'Private Oceanfront Estate Sanctuary'
  }
];

const heritageGalleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    title: 'Vargarammoota Tropical Resort Lagoon & Pool'
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    title: 'The Historic 1928 Coastal Estate Manor'
  },
  {
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    title: 'Infinity Ocean Pool & Sunset Pavilion'
  },
  {
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    title: 'Sommelier Vintage Wine Cellar'
  }
];

// Superyacht & Helipad Auto-Rotating Gallery (Verified Superyacht & Helicopter Fleet)
const yachtHelipadImages = [
  {
    url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80',
    title: 'Superyacht Helipad Chopper Landing Deck'
  },
  {
    url: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80',
    title: 'Executive Offshore Helicopter Transfer'
  },
  {
    url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
    title: 'Private Yacht Sunbathing Lounge & Helipad Deck'
  },
  {
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    title: 'Ocean Megayacht Sunset Charter'
  },
  {
    url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    title: 'Aerial Megayacht Deck & Deep Blue Ocean'
  },
  {
    url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
    title: 'Vargarammoota Coastal Marina & Yacht Fleet'
  }
];

const LandingPage = ({ onOpenAuth, onNavigateCatalog }) => {
  const { suites, diningItems, spaServices, reviews } = useHotelData();

  // White Hero Form State
  const [resort, setResort] = useState('Vargarammoota Grand Resort');
  const [checkIn, setCheckIn] = useState('2026-08-20');
  const [checkOut, setCheckOut] = useState('2026-08-25');
  const [guestSelection, setGuestSelection] = useState('2 Guests, 1 Suite');

  // Auto-Rotating Image Indexes
  const [heroBgIdx, setHeroBgIdx] = useState(0);
  const [heritageIdx, setHeritageIdx] = useState(0);
  const [yachtIdx, setYachtIdx] = useState(0);

  // Interactive Culinary Detail Modal State
  const [selectedDish, setSelectedDish] = useState(null);

  // Scroll Container Refs
  const suiteScrollRef = useRef(null);
  const diningScrollRef = useRef(null);

  // Auto-rotate Hero background, Heritage & Yacht galleries
  useEffect(() => {
    const heroBgTimer = setInterval(() => {
      setHeroBgIdx((prev) => (prev + 1) % heroBackgroundImages.length);
    }, 4500);

    const heritageTimer = setInterval(() => {
      setHeritageIdx((prev) => (prev + 1) % heritageGalleryImages.length);
    }, 3800);

    const yachtTimer = setInterval(() => {
      setYachtIdx((prev) => (prev + 1) % yachtHelipadImages.length);
    }, 4000);

    return () => {
      clearInterval(heroBgTimer);
      clearInterval(heritageTimer);
      clearInterval(yachtTimer);
    };
  }, []);

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* 1. Executive Top Navbar */}
      <nav className="omnistay-navbar">
        <BrandLogo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

        <ul className="nav-links-menu">
          <li className="nav-link-item" onClick={onNavigateCatalog}>Find & Reserve</li>
          <li className="nav-link-item" onClick={() => document.getElementById('heritage-section')?.scrollIntoView({ behavior: 'smooth' })}>Our Heritage</li>
          <li className="nav-link-item" onClick={() => document.getElementById('suites-section')?.scrollIntoView({ behavior: 'smooth' })}>Suites & Villas</li>
          <li className="nav-link-item" onClick={() => document.getElementById('dining-section')?.scrollIntoView({ behavior: 'smooth' })}>Culinary & Spa</li>
          <li className="nav-link-item" onClick={() => document.getElementById('concierge-section')?.scrollIntoView({ behavior: 'smooth' })}>Yacht & Helipad</li>
          <li className="nav-link-item" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>Accolades</li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            className="btn-primary-azure"
            onClick={onOpenAuth}
          >
            Sign In / Register
          </button>
        </div>
      </nav>

      {/* 2. Full-Bleed Hero Section with Crossfading Auto-Rotating Background Carousel & Compact Search Bar */}
      <section className="hero-omnistay-section" style={{ position: 'relative' }}>
        {/* Crossfading Hero Background Image Carousel */}
        {heroBackgroundImages.map((heroImg, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(9, 13, 22, 0.88) 100%), url('${heroImg.url}')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              opacity: heroBgIdx === idx ? 1 : 0,
              transition: 'opacity 1.4s ease-in-out',
              zIndex: 0
            }}
          />
        ))}

        {/* Hero Foreground Content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1040px', marginTop: '30px' }}>
          <div className="hero-fused-subtitle">
            ESTABLISHED 1928 • A CENTURY OF UNRIVALED LUXURY
          </div>
          <h1 className="hero-heading">
            Where Elevated Hospitality Meets Timeless Elegance.
          </h1>
          <p className="hero-subheading">
            Indulge in private oceanfront penthouses, Michelin-starred culinary artistry, and holistic hydrotherapy sanctuaries designed for distinguished guests worldwide.
          </p>
        </div>

        {/* Compact White Hero Search Card */}
        <div className="white-hero-search-bar" style={{ position: 'relative', zIndex: 10 }}>
          <div>
            <label>Destination / Resort</label>
            <select value={resort} onChange={e => setResort(e.target.value)}>
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
            <label>Guests & Accommodations</label>
            <select value={guestSelection} onChange={e => setGuestSelection(e.target.value)}>
              <option value="1 Guest, 1 Suite">1 Guest, 1 Suite</option>
              <option value="2 Guests, 1 Suite">2 Guests, 1 Suite</option>
              <option value="4 Guests, 2 Suites">4 Guests, 2 Suites</option>
              <option value="6 Guests, Private Villa">6 Guests, Private Villa</option>
            </select>
          </div>
          <button className="btn-primary-azure" onClick={onNavigateCatalog}>
            Search Suites
          </button>
        </div>

        {/* Hero Background Slide Indicator Dots */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: '8px', marginTop: '24px' }}>
          {heroBackgroundImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroBgIdx(idx)}
              style={{
                width: heroBgIdx === idx ? '28px' : '10px',
                height: '4px',
                background: heroBgIdx === idx ? 'var(--primary-azure)' : 'rgba(255, 255, 255, 0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </section>

      {/* 3. Expansive Heritage & Estate Story Section ("Since 1928") */}
      <section style={{ background: '#FFFFFF', padding: '120px 40px', borderBottom: '1px solid var(--border-subtle)' }} id="heritage-section">
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <span className="status-pill blue" style={{ marginBottom: '16px' }}>HERITAGE & LEGACY</span>
            <h2 className="section-title" style={{ fontSize: '3rem', textAlign: 'left', marginBottom: '20px' }}>
              Nearly a Century of Bespoke Resort Hospitality
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.08rem', lineHeight: '1.75', marginBottom: '20px' }}>
              Founded in 1928 on the tranquil coastal shores of Vargarammoota, OmniStay Grand Resort has hosted world leaders, royal families, and international luminaries for generations.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.75', marginBottom: '32px' }}>
              Our commitment to personal 24/7 butler concierges, architectural mastery, and sustainable marine reef restoration remains untouched by time.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '28px' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-azure)', fontFamily: "'Playfair Display', serif" }}>1928</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>FOUNDING YEAR</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-azure)', fontFamily: "'Playfair Display', serif" }}>5★</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>MICHELIN ACCLAIM</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-azure)', fontFamily: "'Playfair Display', serif" }}>100%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>PRIVATE BUTLER</div>
              </div>
            </div>
          </div>

          {/* Auto-Rotating Heritage Image Carousel */}
          <div style={{ height: '480px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}>
            <img 
              src={heritageGalleryImages[heritageIdx].url} 
              alt={heritageGalleryImages[heritageIdx].title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.8s ease' }}
            />
            <div style={{ 
              position: 'absolute', bottom: 0, left: 0, width: '100%', 
              padding: '20px', background: 'linear-gradient(0deg, rgba(15, 23, 42, 0.9) 0%, transparent 100%)', 
              color: '#FFFFFF' 
            }}>
              <span className="status-pill blue" style={{ marginBottom: '6px' }}>ESTATE GALLERY</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                {heritageGalleryImages[heritageIdx].title}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Infinite Auto-Scrolling Carousel of Suites & Villas with Manual Scroll Arrows (NO PRICE TAGS) */}
      <section className="capabilities-section" id="suites-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <span className="status-pill blue" style={{ marginBottom: '14px' }}>THE SUITES COLLECTION</span>
            <h2 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Curated Accommodations</h2>
            <p className="section-subtitle" style={{ textAlign: 'left', margin: '6px 0 0 0' }}>
              Explore our private oceanfront penthouses, overwater lagoon villas, and presidential sanctuaries.
            </p>
          </div>

          {/* Manual Scroll Control Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline-pill" style={{ padding: '8px 16px', fontSize: '1.1rem' }} onClick={() => scrollContainer(suiteScrollRef, 'left')}>
              ‹
            </button>
            <button className="btn-outline-pill" style={{ padding: '8px 16px', fontSize: '1.1rem' }} onClick={() => scrollContainer(suiteScrollRef, 'right')}>
              ›
            </button>
          </div>
        </div>

        {/* Auto & Manual Horizontal Scroll Container */}
        <div className="horizontal-scroll-container" ref={suiteScrollRef}>
          {suites.map((suite) => (
            <div key={suite.id} className="carousel-card">
              <div style={{ height: '260px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                <img src={suite.image} alt={suite.title} className="hover-zoom-img" />
                <span className="status-pill available" style={{ position: 'absolute', top: '14px', right: '14px' }}>
                  {suite.category}
                </span>
              </div>
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                  {suite.capacity} • {suite.size}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>{suite.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.55', marginBottom: '20px' }}>
                  {suite.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--primary-azure)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    5-Star Luxury Suite
                  </span>
                  <button className="btn-primary-azure" style={{ padding: '8px 18px' }} onClick={onNavigateCatalog}>
                    Explore Suite
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Michelin Culinary Fine Dining Interactive Auto-Scrolling Carousel (NO PRICE TAGS) */}
      <section style={{ background: 'var(--bg-dark-slate)', padding: '120px 40px', color: '#FFFFFF' }} id="dining-section">
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <span className="status-pill blue" style={{ marginBottom: '14px' }}>CULINARY ARTISTRY</span>
              <h2 className="section-title" style={{ color: '#FFFFFF', textAlign: 'left', margin: 0 }}>Azure Fine Dining & Sommelier Lounge</h2>
              <p className="section-subtitle" style={{ color: '#94A3B8', textAlign: 'left', margin: '6px 0 0 0' }}>
                Featuring charcoal-grilled A5 Wagyu, wild ocean seafood, caviar, and rare vintage champagne cellars. Scroll left/right or click any dish for chef details.
              </p>
            </div>

            {/* Manual Scroll Control Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-outline-pill" style={{ padding: '8px 16px', fontSize: '1.1rem', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => scrollContainer(diningScrollRef, 'left')}>
                ‹
              </button>
              <button className="btn-outline-pill" style={{ padding: '8px 16px', fontSize: '1.1rem', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => scrollContainer(diningScrollRef, 'right')}>
                ›
              </button>
            </div>
          </div>

          {/* Interactive Horizontal Scroll Container for Culinary Dishes */}
          <div className="horizontal-scroll-container" ref={diningScrollRef}>
            {diningItems.map(item => (
              <div 
                key={item.id} 
                className="carousel-card"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)', cursor: 'pointer' }}
                onClick={() => setSelectedDish(item)}
              >
                <div style={{ height: '230px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={item.image} alt={item.name} className="hover-zoom-img" />
                </div>
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{item.category}</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '6px', marginBottom: '10px', color: '#FFFFFF' }}>{item.name}</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.55', marginBottom: '20px' }}>{item.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.82rem', color: '#38BDF8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Chef Signature</span>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700 }}>Inspect Dish →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Helipad, Yacht Charter & Executive Butler Concierge with Auto-Rotating Yacht & Helipad Gallery */}
      <section style={{ background: '#FFFFFF', padding: '120px 40px', borderTop: '1px solid var(--border-subtle)' }} id="concierge-section">
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          {/* Auto-Rotating Superyacht & Helipad Gallery (No Scuba Diving Photos) */}
          <div style={{ height: '460px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}>
            <img 
              src={yachtHelipadImages[yachtIdx].url} 
              alt={yachtHelipadImages[yachtIdx].title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.8s ease' }}
            />
            <div style={{ 
              position: 'absolute', bottom: 0, left: 0, width: '100%', 
              padding: '20px', background: 'linear-gradient(0deg, rgba(15, 23, 42, 0.9) 0%, transparent 100%)', 
              color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <span className="status-pill blue" style={{ marginBottom: '6px' }}>SUPERYACHT & HELIPAD FLEET</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                  {yachtHelipadImages[yachtIdx].title}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setYachtIdx((prev) => (prev - 1 + yachtHelipadImages.length) % yachtHelipadImages.length)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 800 }}
                >
                  ‹
                </button>
                <button 
                  onClick={() => setYachtIdx((prev) => (prev + 1) % yachtHelipadImages.length)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 800 }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          <div>
            <span className="status-pill blue" style={{ marginBottom: '14px' }}>EXECUTIVE CONCIERGE</span>
            <h2 className="section-title" style={{ textAlign: 'left', fontSize: '2.8rem', marginBottom: '18px' }}>
              Superyacht Helipad Arrivals & Sunset Charters
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '18px' }}>
              Arrive via private offshore helicopter directly onto our superyacht landing pad, or embark on a sunset voyage aboard our 85-foot luxury motor yacht.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 700 }}>
              <li>✔ Direct Offshore Helipad Chopper & Limousine Transfers</li>
              <li>✔ Private Superyacht Sunset Charters & Deep Sea Cruising</li>
              <li>✔ 24/7 Dedicated Personal Butler Concierge</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. Royal Hydrotherapy Pavilion Spa Section (NO PRICE TAGS) */}
      <section style={{ background: 'var(--border-light)', padding: '100px 40px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div className="section-header-center">
            <span className="status-pill blue" style={{ marginBottom: '14px' }}>WELLNESS & SPA</span>
            <h2 className="section-title">Royal Hydrotherapy Pavilion</h2>
            <p className="section-subtitle">Rejuvenating thermal mineral soak baths and organic botanical therapies.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {spaServices.map(spa => (
              <div key={spa.id} className="white-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', minHeight: '220px', alignItems: 'stretch', borderRadius: '16px' }}>
                <div style={{ width: '38%', flexShrink: 0 }}>
                  <img src={spa.image} alt={spa.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ width: '62%', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div>
                    <span className="status-pill blue">{spa.duration}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '8px', marginBottom: '8px', color: 'var(--text-main)' }}>{spa.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{spa.description}</p>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--primary-azure)', fontWeight: 800, textTransform: 'uppercase', marginTop: '12px', letterSpacing: '0.6px' }}>
                    Complimentary Sanctuary Spa
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Infinite Auto-Scrolling Testimonials Ticker with Amber Gold Stars */}
      <section style={{ background: '#FFFFFF', padding: '120px 40px', overflow: 'hidden' }} id="reviews-section">
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div className="section-header-center">
            <span className="status-pill blue" style={{ marginBottom: '14px' }}>GUEST ACCOLADES</span>
            <h2 className="section-title">Testimonials & International Praise</h2>
            <p className="section-subtitle">Hear from distinguished leaders and worldwide guests who made OmniStay their resort sanctuary.</p>
          </div>

          <div className="testimonial-ticker-wrapper">
            <div style={{ display: 'flex', gap: '28px', paddingRight: '28px' }}>
              {reviews.concat(reviews).map((rev, i) => (
                <div key={i} className="white-card" style={{ minWidth: '380px', maxWidth: '380px', background: 'var(--bg-app)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontFamily: "'Playfair Display', serif" }}>{rev.guestName}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rev.location}</div>
                    </div>
                    <div className="star-gold">★★★★★</div>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.6' }}>
                    "{rev.comment}"
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-azure)', marginTop: '16px', fontWeight: 800, textTransform: 'uppercase' }}>
                    ✔ Verified Guest Stay • {rev.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Culinary Detail Pop-Up Modal (NO PRICE TAGS) */}
      {selectedDish && (
        <div className="auth-modal-overlay" onClick={() => setSelectedDish(null)}>
          <div className="auth-modal-box" onClick={e => e.stopPropagation()} style={{ width: '520px' }}>
            <button 
              className="auth-modal-close-btn"
              onClick={() => setSelectedDish(null)}
            >
              ✕
            </button>
            
            <div style={{ height: '220px', overflow: 'hidden', marginBottom: '16px' }}>
              <img src={selectedDish.image} alt={selectedDish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <span className="status-pill blue">{selectedDish.category}</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '8px', marginBottom: '8px' }}>{selectedDish.name}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>{selectedDish.description}</p>
            
            <div style={{ padding: '12px', background: 'var(--border-light)', border: '1px solid var(--border-subtle)', marginBottom: '16px', fontSize: '0.82rem', fontWeight: 700 }}>
              🍷 Sommelier Pairing: Dom Pérignon Brut 2013 or Aged Pinot Noir
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary-azure)', fontWeight: 800, textTransform: 'uppercase' }}>Signature Tasting Menu</span>
              <button className="btn-primary-azure" onClick={() => { setSelectedDish(null); onOpenAuth(); }}>
                Order via In-Room Dining
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Global Brand Footer */}
      <footer style={{ background: 'var(--bg-dark-slate)', color: '#94A3B8', padding: '80px 40px 30px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '50px' }}>
          <div>
            <div style={{ marginBottom: '16px' }}>
              <BrandLogo darkMode={true} subtitle="LUXURY COLLECTION" />
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.65', maxWidth: '340px' }}>
              A century of unrivaled luxury accommodations, Michelin fine dining, private lagoon sanctuaries, and coastal chopper arrivals.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '18px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Resorts & Portfolio</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <li>Presidential Penthouses</li>
              <li>Sunset Lagoon Villas</li>
              <li>Grand Deluxe King Suites</li>
              <li>Royal Horizon Sanctuaries</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '18px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Dining & Wellness</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <li>Azure Oceanfront Dining</li>
              <li>Sommelier Vintage Cellar</li>
              <li>Royal Hydrotherapy Pavilion</li>
              <li>Botanical Massage Spa</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '18px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Guest Concierge</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <li>Helipad Chopper Transfer</li>
              <li>Motor Yacht Sunset Charter</li>
              <li>Private Butler Concierge</li>
              <li>24/7 In-Room Fine Dining</li>
            </ul>
          </div>
        </div>

        <div style={{ maxWidth: '1320px', margin: '0 auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <div>© 2026 OmniStay Grand Resorts. All Rights Reserved.</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Stay</span>
            <span>5-Star Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
