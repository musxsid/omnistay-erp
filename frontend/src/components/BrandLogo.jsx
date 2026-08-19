import React from 'react';

const BrandLogo = ({ subtitle = "LUXURY COLLECTION", size = "normal", onClick }) => {
  const isSmall = size === "small";

  return (
    <div 
      className="omnistay-brand" 
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: onClick ? 'pointer' : 'default', textDecoration: 'none' }}
    >
      {/* Luxury Crest Monogram SVG */}
      <svg width={isSmall ? "30" : "36"} height={isSmall ? "30" : "36"} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" fill="#0F172A" />
        <path d="M20 6L32 14V26L20 34L8 26V14L20 6Z" stroke="#0084FF" strokeWidth="2.5" />
        <circle cx="20" cy="20" r="5" fill="#F59E0B" />
        <path d="M20 11V15M20 25V29M11 20H15M25 20H29" stroke="#0084FF" strokeWidth="1.5" strokeLinecap="square" />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          fontFamily: "'Playfair Display', Georgia, serif", 
          fontSize: isSmall ? '1.1rem' : '1.3rem', 
          fontWeight: 900, 
          color: '#0F172A',
          letterSpacing: '-0.5px',
          lineHeight: '1'
        }}>
          OmniStay <span style={{ color: '#0084FF' }}>Resorts</span>
        </div>
        {subtitle && (
          <span style={{ 
            fontSize: '0.58rem', 
            fontWeight: 800, 
            color: '#64748B', 
            letterSpacing: '1.5px', 
            textTransform: 'uppercase',
            marginTop: '3px',
            fontFamily: "'Cinzel', serif"
          }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
