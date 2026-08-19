import React, { useState } from 'react';

const SuiteDetailsModal = ({ suite, onClose, onAction, actionText = 'Reserve Suite' }) => {
  if (!suite) return null;

  // Build 4 high-res gallery site images per suite
  const defaultGallery = [
    suite.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
  ];

  const galleryImages = (suite.gallery && suite.gallery.length > 0) ? suite.gallery : defaultGallery;
  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  return (
    <div 
      className="auth-modal-overlay" 
      onClick={onClose}
      style={{ zIndex: 1100, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div 
        className="auth-modal-box" 
        onClick={e => e.stopPropagation()} 
        style={{ width: '860px', maxWidth: '94%', padding: 0, overflow: 'hidden', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Modal Top Header Bar */}
        <div style={{ padding: '20px 28px', background: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="status-pill blue" style={{ background: '#0284C7', color: '#FFFFFF', border: 'none', fontWeight: 800, padding: '4px 12px' }}>
              {suite.category || 'LUXURY SUITE'}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700 }}>
              {suite.roomNumber ? `Suite ${suite.roomNumber}` : (suite.id || 'RESORT ACCOMMODATION')}
            </span>
          </div>

          <button 
            type="button"
            onClick={onClose}
            style={{ background: '#1E293B', border: 'none', color: '#94A3B8', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900, fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body Content (2 Columns Layout) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', background: '#FFFFFF' }}>
          
          {/* Left Column: Interactive Image Showcase & Gallery Thumbnails */}
          <div style={{ padding: '24px', background: '#F8FAFC', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '100%', height: '310px', borderRadius: '14px', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
              <img 
                src={activeImage} 
                alt={suite.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }} 
              />
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(15,23,42,0.75)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                Site Photo {galleryImages.indexOf(activeImage) + 1} of {galleryImages.length}
              </div>
            </div>

            {/* Gallery Selector Thumbnails */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                Architectural Site Views & Interiors
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {galleryImages.map((imgUrl, index) => (
                  <div 
                    key={index} 
                    onClick={() => setActiveImage(imgUrl)}
                    style={{ 
                      height: '65px', 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      cursor: 'pointer', 
                      border: activeImage === imgUrl ? '2px solid var(--primary-azure)' : '2px solid transparent',
                      opacity: activeImage === imgUrl ? 1 : 0.65,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={imgUrl} alt={`Site ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Full Suite Specs, Description & Amenities */}
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0', fontFamily: "'Playfair Display', serif" }}>
                {suite.title}
              </h2>

              {/* Price & Rates Bar */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '18px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-azure)', fontFamily: "'Playfair Display', serif" }}>
                  ${Number(suite.price || suite.amount || 450).toFixed(2)}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>/ night (Admin Predefined)</span>
              </div>

              {/* Specs Grid Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', background: '#F1F5F9', padding: '12px 14px', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>Guest Capacity</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>{suite.capacity || '2-4 Guests'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>Floor Layout</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>{suite.size || '160 sq.m'}</div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '6px' }}>
                  Living Experience & Overview
                </div>
                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  {suite.description || 'Top-tier luxury resort suite offering floor-to-ceiling glass walls, executive master bedroom, private plunge pool, and dedicated butler service.'}
                </p>
              </div>

              {/* Luxury Amenities List */}
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '8px' }}>
                  Signature In-Suite Amenities
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(suite.amenities && suite.amenities.length > 0 ? suite.amenities : [
                    'Private Infinity Pool', 'Master Hydro Tub', '24/7 Butler Service', 'Executive Lounge Access', 'Bose Surround Audio', 'Nespresso Bar'
                  ]).map((amenity, i) => (
                    <span 
                      key={i} 
                      style={{ 
                        background: '#EFF6FF', 
                        color: '#1E40AF', 
                        border: '1px solid #BFDBFE', 
                        fontSize: '0.73rem', 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontWeight: 700 
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar Footer */}
            {onAction && (
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  type="button"
                  className="btn-primary-azure" 
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.9rem', fontWeight: 800, borderRadius: '10px' }}
                  onClick={() => {
                    onClose();
                    onAction(suite);
                  }}
                >
                  {actionText}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuiteDetailsModal;
