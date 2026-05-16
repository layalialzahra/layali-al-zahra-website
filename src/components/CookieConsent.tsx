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
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9997,
          background: 'rgba(74, 6, 28, 0.97)',
          color: 'white',
          padding: '16px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
          borderTop: '1px solid rgba(244,63,94,0.3)',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', maxWidth: '780px', color: '#fce7f3' }}>
          We use cookies and similar technologies to analyse website traffic and improve your experience.
          By continuing to use this site, you agree to our use of cookies in accordance with the UAE Personal Data
          Protection Law (PDPL).{' '}
          <a
            href="#privacy"
            style={{ color: '#fbbf24', textDecoration: 'underline', fontWeight: 600 }}
          >
            Learn more
          </a>
        </p>
        <button
          onClick={handleAccept}
          style={{
            background: '#f43f5e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 28px',
            fontSize: '14px',
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
  