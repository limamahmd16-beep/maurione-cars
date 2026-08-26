import React, { useEffect, useState } from 'react';
import UserGate from './UserGate.jsx';

const APPROVED_SVG = '/welcome-approved-site.svg?v=22';

export default function SafeEntry({ children }) {
  const [entry, setEntry] = useState(() => {
    try {
      return sessionStorage.getItem('maurione_guest') === '1' ? 'app' : 'welcome';
    } catch {
      return 'welcome';
    }
  });
  const [imageSrc, setImageSrc] = useState('');
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWelcomeArtwork() {
      try {
        const response = await fetch(APPROVED_SVG, { cache: 'no-store' });
        if (!response.ok) throw new Error('welcome-svg-request-failed');

        const svg = await response.text();
        const match = svg.match(/data:image\/jpeg;base64,([^\"']+)/i);
        if (!match || !match[1] || !match[1].startsWith('/9j/')) {
          throw new Error('welcome-jpeg-not-found');
        }

        if (!cancelled) {
          setImageSrc(`data:image/jpeg;base64,${match[1]}`);
        }
      } catch {
        if (!cancelled) setImageFailed(true);
      }
    }

    if (entry === 'welcome') loadWelcomeArtwork();
    return () => { cancelled = true; };
  }, [entry]);

  useEffect(() => {
    if (entry !== 'auth') return;
    const fire = () => window.dispatchEvent(new Event('maurione:show-auth'));
    const timer = window.setTimeout(fire, 60);
    return () => window.clearTimeout(timer);
  }, [entry]);

  function openLogin() {
    try { sessionStorage.removeItem('maurione_guest'); } catch {}
    setEntry('auth');
  }

  function enterGuest() {
    try { sessionStorage.setItem('maurione_guest', '1'); } catch {}
    setEntry('app');
  }

  if (entry !== 'welcome') {
    return <UserGate>{children}</UserGate>;
  }

  return (
    <main
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        background: '#fff',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Tahoma,Arial,sans-serif',
      }}
    >
      <section
        style={{
          position: 'relative',
          width: 'min(100vw, 760px)',
          height: '100dvh',
          maxHeight: '100dvh',
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        <div
          aria-hidden={imageReady}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '7% 8%',
            textAlign: 'center',
            background: 'linear-gradient(180deg,#ffffff 0%,#fbfbfb 100%)',
            color: '#151515',
          }}
        >
          <div style={{ direction: 'ltr', fontSize: 'clamp(42px,10vw,72px)', fontWeight: 850, letterSpacing: '-3px', lineHeight: 1 }}>
            <span style={{ color: '#111' }}>Mauri</span><span style={{ color: '#ff5a12' }}>One</span>
          </div>
          <h1 style={{ margin: '7% 0 2%', fontSize: 'clamp(30px,7vw,48px)', fontWeight: 800 }}>مرحبًا بك</h1>
          <div style={{ width: 58, height: 5, borderRadius: 99, background: '#ff5a12', marginBottom: '5%' }} />
          <p style={{ margin: 0, maxWidth: 560, color: '#555b64', fontSize: 'clamp(14px,3.4vw,21px)', lineHeight: 2 }}>
            منصة موثوقة لبيع السيارات في موريتانيا، تتيح لك استعراض السيارات المتاحة ومقارنة الأسعار والتفاصيل بسهولة.
          </p>
          <div style={{ flex: 1, minHeight: 60 }} />
          {imageFailed && <div style={{ color: '#8a8f97', fontSize: 12, marginBottom: 12 }}>MauriOne Cars</div>}
          <button
            type="button"
            onClick={openLogin}
            style={{ width: '100%', minHeight: 58, border: 0, borderRadius: 18, background: '#ff5a12', color: '#fff', fontSize: 20, fontWeight: 800 }}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={enterGuest}
            style={{ width: '100%', minHeight: 58, marginTop: 12, border: '1px solid #ff5a12', borderRadius: 18, background: '#fff', color: '#ff5a12', fontSize: 19, fontWeight: 800 }}
          >
            الدخول كزائر
          </button>
        </div>

        {!!imageSrc && !imageFailed && (
          <img
            src={imageSrc}
            alt="MauriOne Cars"
            draggable="false"
            onLoad={() => setImageReady(true)}
            onError={() => setImageFailed(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              display: 'block',
              opacity: imageReady ? 1 : 0,
              transition: 'opacity .12s linear',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          />
        )}

        {imageReady && (
          <>
            <button
              type="button"
              onClick={openLogin}
              aria-label="تسجيل الدخول"
              style={{ position: 'absolute', left: '9%', right: '9%', top: '78.8%', height: '7.9%', border: 0, background: 'transparent', zIndex: 5, WebkitTapHighlightColor: 'transparent' }}
            />
            <button
              type="button"
              onClick={enterGuest}
              aria-label="الدخول كزائر"
              style={{ position: 'absolute', left: '9%', right: '9%', top: '87.7%', height: '7.8%', border: 0, background: 'transparent', zIndex: 5, WebkitTapHighlightColor: 'transparent' }}
            />
          </>
        )}
      </section>
    </main>
  );
}
