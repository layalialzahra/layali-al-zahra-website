import React, { useState, useEffect } from 'react';

  export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const accepted = localStorage.getItem('layali-cookie-consent');
      if (!accepted) setVisible(true);
    }, []);

    const handleAccept = () => {
      localStorage.setItem('layali-cookie-consent', 'accepted');
      setVisible(false);
    };

    if (!visible) return null;

    return (
      <div
        role="dialog"
        aria-label="Cookie consent"
        style={{
          position: 'fixed',
          bottom: '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(960px, calc(100% - 36px))',
          zIndex: 9997,
          background: 'rgba(23, 18, 15, 0.98)',
          color: '#211711',
          padding: '13px 20px',
          border: '1px solid rgba(200,167,125,0.42)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 12px 42px rgba(0,0,0,0.28)',
          borderRadius: '3px',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', maxWidth: '780px', color: '#e4d8c8' }}>
          We use cookies and similar technologies to analyse website traffic and improve your experience.
          By continuing to use this site, you agree to our use of cookies in accordance with the UAE Personal Data
          Protection Law (PDPL).{' '}
          <a
            href="#privacy"
            style={{ color: '#d7b58a', textDecoration: 'underline', fontWeight: 600 }}
          >
            Learn more
          </a>
        </p>
        <button
          onClick={handleAccept}
          style={{
            background: '#c8a77d',
            color: '#211711',
            border: 'none',
            borderRadius: '2px',
            padding: '11px 20px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}
        >
          Accept & Close
        </button>
      </div>
    );
  }
  