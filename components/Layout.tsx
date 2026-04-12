import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ChatWidget from '../src/components/ai/ChatWidget';

const Layout: React.FC = () => {
  const { pathname } = useLocation();

  /* ── scroll-to-top on route change (unchanged) ── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  /*
     Which pages are "full-bleed" — they manage their own width,
     padding, and section spacing internally.
     Every other route gets wrapped in a centred, padded container.
  */
  const isFullBleed = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-bg-white font-sans text-slate-800 relative
                    selection:bg-primary/20 selection:text-primary">

      {/* ╔══════════════════════════════════════════
          ║  AMBIENT BACKGROUND  (fixed, non-interactive)
          ║  Three soft orbs that bleed colour into the page
          ║  without competing with any content layer.
          ╚══════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* top-right — warm secondary glow */}
        <div className="absolute -top-[12%] -right-[8%] w-130 h-130
                        bg-secondary rounded-full blur-[120px] opacity-[0.06]" />
        {/* bottom-left — deep primary glow */}
        <div className="absolute -bottom-[14%] -left-[6%] w-150 h-150
                        bg-primary rounded-full blur-[140px] opacity-[0.05]" />
        {/* centre — very faint sage accent, adds warmth to mid-page */}
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2
                        w-100 h-100
                        bg-subtle-accent rounded-full blur-[160px] opacity-[0.04]" />
      </div>

      {/* ╔══ HEADER (above everything) ══╗ */}
      <div className="relative z-50">
        <Header />
      </div>

      {/* ╔══════════════════════════════════════════
          ║  MAIN CONTENT
          ║  Full-bleed pages (Home) render directly so their
          ║  heroes and stats bars can stretch edge-to-edge.
          ║  All other pages get a centred container with
          ║  consistent gutters and vertical rhythm.
          ╚══════════════════════════════════════════ */}
      <main className="grow relative z-10 w-full">
        {isFullBleed ? (
          /* full-bleed — no wrapper, page owns its layout */
          <div className="animate-fade-in">
            <Outlet />
          </div>
        ) : (
          /* contained — standard interior pages */
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
                          py-10 lg:py-16 min-h-[60vh]
                          animate-fade-in">
            <Outlet />
          </div>
        )}
      </main>

      {/* ╔══ CHAT WIDGET (floats above footer) ══╗ */}
      <ChatWidget />

      {/* ╔══ FOOTER (above ambient, below chat) ══╗ */}
      <div className="relative z-50">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;