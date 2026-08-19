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
        return '⚠️';
      case 'CONFIRM':
        return '🚪';
      case 'SUCCESS':
        return '✨';
      default:
        return '🔔';
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
            fontSize: '1.6rem',
            margin: '0 auto 16px auto'
          }}
        >
          {getIcon()}
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>
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
              onClick={onClose}
            >
              Understand & Continue
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomModal;
