import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ChatWidget from '../src/components/ai/ChatWidget';

const Layout: React.FC = () => {
  /* ── PRESERVED LOGIC ── */
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  const isFullBleed = pathname === '/';

  /* ══════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════ */
  return (
    <div
      className="relative flex flex-col min-h-screen overflow-x-hidden"
      style={{
        background: 'var(--clr-dark, #050f07)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        color: 'rgba(245,245,245,0.92)',
      }}
    >

      {/* ══════════════════════════════════════════════════════
          GLOBAL TOKENS + KEYFRAMES — injected once at root
          ══════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

        :root {
          --clr-lime:  #B5F720;
          --clr-mint:  #1BFA99;
          --clr-green: #3EFA48;
          --clr-sage:  #8CFA98;
          --clr-dark:  #050f07;
          --clr-ink:   #0d1f10;
        }

        /* text selection */
        ::selection {
          background: rgba(181,247,32,0.18);
          color: #B5F720;
        }

        /* Retro grid drift */
        @keyframes lay-grid-drift {
          0%   { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }

        /* Moving border for contained-page top accent */
        @keyframes lay-border-spin {
          0%   { background-position: 0%   50%; }
          100% { background-position: 200% 50%; }
        }
        .lay-moving-border {
          background: linear-gradient(
            90deg,
            var(--clr-lime), var(--clr-mint), var(--clr-green), var(--clr-sage), var(--clr-lime)
          );
          background-size: 300% 100%;
          animation: lay-border-spin 5s linear infinite;
        }

        /* Page fade-in on route change */
        @keyframes lay-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lay-fade-in {
          animation: lay-fade-in 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        /* Noise texture */
        .lay-noise::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0.022;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          mix-blend-mode: overlay;
        }

        /* Scrollbar — dark themed */
        ::-webkit-scrollbar        { width: 6px; }
        ::-webkit-scrollbar-track  { background: #050f07; }
        ::-webkit-scrollbar-thumb  { background: rgba(62,250,72,0.20); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(181,247,32,0.35); }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          FIXED ATMOSPHERIC LAYER — behind all content, z-0
          ══════════════════════════════════════════════════════ */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        {/* Beam SVG — three directional radial gradients */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.16 }}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="lay-rg1" cx="12%" cy="18%" r="55%">
              <stop offset="0%" stopColor="#3EFA48" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3EFA48" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lay-rg2" cx="88%" cy="78%" r="52%">
              <stop offset="0%" stopColor="#1BFA99" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#1BFA99" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lay-rg3" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#B5F720" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#B5F720" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#lay-rg1)" />
          <rect width="100%" height="100%" fill="url(#lay-rg2)" />
          <rect width="100%" height="100%" fill="url(#lay-rg3)" />
          {[...Array(6)].map((_, i) => (
            <line
              key={i}
              x1={`${8 + i * 16}%`} y1="0%"
              x2={`${4 + i * 16}%`} y2="100%"
              stroke="#3EFA48"
              strokeWidth="0.4"
              strokeOpacity={0.025 + i * 0.005}
            />
          ))}
        </svg>

        {/* Dot-grid watermark */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(62,250,72,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Animated retro grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(62,250,72,0.022) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(62,250,72,0.022) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'lay-grid-drift 28s linear infinite',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        />

        {/* Ambient orbs */}
        <div
          className="absolute rounded-full blur-[180px]"
          style={{
            top: '-12%', right: '-8%',
            width: '520px', height: '520px',
            background: 'rgba(181,247,32,0.06)',
          }}
        />
        <div
          className="absolute rounded-full blur-[200px]"
          style={{
            bottom: '-14%', left: '-6%',
            width: '600px', height: '600px',
            background: 'rgba(62,250,72,0.05)',
          }}
        />
        <div
          className="absolute rounded-full blur-[220px] -translate-x-1/2"
          style={{
            top: '40%', left: '50%',
            width: '400px', height: '400px',
            background: 'rgba(27,250,153,0.04)',
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════
          HEADER — elevated above ambient layer
          ══════════════════════════════════════════════════════ */}
      <div className="relative" style={{ zIndex: 50 }}>
        <Header />
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT
          Full-bleed (Home): page owns its layout entirely.
          Contained (all other routes): wrapped in a dark-glass
          bento panel with moving-border top accent + noise.
          ══════════════════════════════════════════════════════ */}
      <main className="grow relative w-full" style={{ zIndex: 10 }}>

        {isFullBleed ? (

          /* ── Full-bleed — no constraints ── */
          <div className="lay-fade-in">
            <Outlet />
          </div>

        ) : (

          /* ── Contained interior pages ── */
          <div className="lay-fade-in max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 min-h-[60vh]">

            {/* Dark-glass bento panel */}
            <div
              className="lay-noise relative rounded-[32px] overflow-hidden px-6 py-8 sm:px-10 sm:py-12"
              style={{
                background: 'rgba(13,31,16,0.72)',
                border: '1px solid rgba(62,250,72,0.09)',
                boxShadow:
                  '0 20px 60px rgba(0,0,0,0.32), ' +
                  '0 0 0 0.5px rgba(62,250,72,0.06)',
              }}
            >
              {/* Moving border — top edge */}
              <div
                className="lay-moving-border absolute top-0 left-0 right-0"
                style={{ height: '1.5px', opacity: 0.70 }}
              />

              {/* Inner dot-grid */}
              <div
                className="absolute inset-0 rounded-[32px] pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(62,250,72,0.06) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                  opacity: 0.5,
                }}
              />

              {/* Corner ambient glow */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[80px] pointer-events-none"
                style={{ background: 'rgba(181,247,32,0.05)' }}
              />

              <div className="relative z-10">
                <Outlet />
              </div>
            </div>
          </div>

        )}
      </main>

      {/* ══════════════════════════════════════════════════════
          CHAT WIDGET — floats above footer
          ══════════════════════════════════════════════════════ */}
      <ChatWidget />

      {/* ══════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════ */}
      <div className="relative" style={{ zIndex: 50 }}>
        <Footer />
      </div>

    </div>
  );
};

export default Layout;