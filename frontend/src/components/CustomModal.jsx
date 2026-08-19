import React from 'react';

/**
 * CustomModal Component
 * Replaces ugly browser alert() and confirm() dialogs with luxury, theme-matching popups.
 * 
 * Props:
 * - isOpen (boolean)
 * - type: 'ALERT' | 'CONFIRM' | 'SUCCESS' | 'WARNING'
 * - title (string)
 * - message (string)
 * - confirmText (string, default: 'Confirm')
 * - cancelText (string, default: 'Cancel')
 * - onConfirm (function)
 * - onClose (function)
 */
const CustomModal = ({
  isOpen,
  type = 'ALERT',
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'WARNING':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case 'CONFIRM':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        );
      case 'SUCCESS':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0084FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
    }
  };

  return (
    <div 
      className="auth-modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div 
        className="white-card" 
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          width: '90%',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            fontWeight: 800,
            color: 'var(--text-muted)'
          }}
        >
          ✕
        </button>

        {/* Icon Circle */}
        <div 
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: type === 'CONFIRM' || type === 'WARNING' ? '#FEF3C7' : '#F0F9FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}
        >
          {getIcon()}
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: "'Playfair Display', 'Georgia', serif", color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>
          {title || (type === 'CONFIRM' ? 'Sign Out Confirmation' : 'Notification')}
        </h3>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 24px 0', lineHeight: '1.5' }}>
          {message}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {type === 'CONFIRM' ? (
            <>
              <button 
                type="button" 
                className="btn-outline-pill" 
                style={{ flex: 1, padding: '10px 18px', borderRadius: '30px', justifyContent: 'center' }}
                onClick={onClose}
              >
                {cancelText}
              </button>
              <button 
                type="button" 
                className="btn-primary-azure" 
                style={{ flex: 1, padding: '10px 18px', borderRadius: '30px', justifyContent: 'center', background: '#DC2626' }}
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button 
              type="button" 
              className="btn-primary-azure" 
              style={{ minWidth: '140px', padding: '10px 24px', borderRadius: '30px', justifyContent: 'center' }}
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
            >
              {confirmText || 'UNDERSTAND & CONTINUE'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomModal;
