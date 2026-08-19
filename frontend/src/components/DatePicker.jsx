import React, { useState, useRef, useEffect } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to format ISO date string (YYYY-MM-DD) to luxury display date (e.g. "Aug 20, 2026")
const formatDisplayDate = (isoStr) => {
  if (!isoStr) return 'Select Date';
  const [y, m, d] = isoStr.split('-').map(Number);
  if (!y || !m || !d) return isoStr;
  const dateObj = new Date(y, m - 1, d);
  const shortMonth = MONTH_NAMES[dateObj.getMonth()].substring(0, 3);
  return `${shortMonth} ${d}, ${y}`;
};

const DatePicker = ({ label, value, onChange, minDate, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse current value or fallback to today
  const parsedValue = value ? new Date(value + 'T00:00:00') : new Date();
  
  const [navYear, setNavYear] = useState(parsedValue.getFullYear());
  const [navMonth, setNavMonth] = useState(parsedValue.getMonth());
  
  const containerRef = useRef(null);

  // Sync nav month/year when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setNavYear(d.getFullYear());
        setNavMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside listener to close popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(navYear - 1);
    } else {
      setNavMonth(navMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(navYear + 1);
    } else {
      setNavMonth(navMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const m = String(navMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const formatted = `${navYear}-${m}-${d}`;
    onChange(formatted);
    setIsOpen(false);
  };

  // Calendar calculations
  const firstDayOfWeek = new Date(navYear, navMonth, 1).getDay();
  const daysInMonth = new Date(navYear, navMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(navYear, navMonth, 0).getDate();

  // Selected date components
  const selectedY = parsedValue.getFullYear();
  const selectedM = parsedValue.getMonth();
  const selectedD = parsedValue.getDate();

  // Min date parsing
  const minDateObj = minDate ? new Date(minDate + 'T00:00:00') : null;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          {label}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: '42px',
          padding: '10px 12px',
          background: '#F8FAFC',
          border: isOpen ? '1px solid var(--primary-azure)' : '1px solid var(--border-subtle)',
          boxShadow: isOpen ? '0 0 0 2px rgba(0, 132, 255, 0.15)' : 'none',
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          transition: 'all 0.15s ease',
          margin: 0
        }}
      >
        <span>{formatDisplayDate(value)}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-azure)" strokeWidth="2" strokeLinecap="square">
          <rect x="3" y="4" width="18" height="18" rx="0" ry="0"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </button>

      {/* Custom Popover Calendar Modal */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 9999,
            width: '310px',
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.22)',
            padding: '18px',
            animation: 'modalPopIn 0.15s ease-out'
          }}
        >
          {/* Calendar Header Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)',
                fontWeight: 800,
                fontSize: '0.9rem'
              }}
            >
              ‹
            </button>

            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
              {MONTH_NAMES[navMonth]} {navYear}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)',
                fontWeight: 800,
                fontSize: '0.9rem'
              }}
            >
              ›
            </button>
          </div>

          {/* Weekday Names Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
            {WEEKDAYS.map((day, idx) => (
              <span key={day} style={{ fontSize: '0.68rem', fontWeight: 800, color: idx === 0 || idx === 6 ? '#EF4444' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
            {/* Prev month days (faded) */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
              const dayNum = daysInPrevMonth - firstDayOfWeek + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  style={{
                    padding: '8px 0',
                    fontSize: '0.8rem',
                    color: '#CBD5E1',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected = selectedY === navYear && selectedM === navMonth && selectedD === day;
              
              const currentDateObj = new Date(navYear, navMonth, day);
              const isDisabled = minDateObj && currentDateObj < minDateObj;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  style={{
                    padding: '8px 0',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 800 : 600,
                    background: isSelected ? 'var(--primary-azure)' : 'transparent',
                    color: isSelected ? '#FFFFFF' : isDisabled ? '#CBD5E1' : 'var(--text-main)',
                    border: isSelected ? '1px solid var(--primary-azure)' : '1px solid transparent',
                    borderRadius: 0,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.12s ease',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isDisabled) {
                      e.currentTarget.style.background = 'rgba(0, 132, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isDisabled) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setNavYear(today.getFullYear());
                setNavMonth(today.getMonth());
                handleSelectDay(today.getDate());
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary-azure)',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                padding: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'var(--border-light)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 10px',
                textTransform: 'uppercase'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
