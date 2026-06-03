import React from 'react';
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ══════════════════════════════════════════════════════
   GLOBAL STYLES — injected once
   ══════════════════════════════════════════════════════ */
const FooterStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

    :root {
      --clr-lime:  #B5F720;
      --clr-mint:  #1BFA99;
      --clr-green: #3EFA48;
      --clr-sage:  #8CFA98;
      --clr-dark:  #050f07;
      --clr-ink:   #0d1f10;
    }

    /* Retro animated grid */
    .footer-retro-grid::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(62,250,72,0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(62,250,72,0.045) 1px, transparent 1px);
      background-size: 52px 52px;
      mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 100%);
      animation: footer-grid-drift 24s linear infinite;
      pointer-events: none;
    }
    @keyframes footer-grid-drift {
      0%   { background-position: 0 0; }
      100% { background-position: 52px 52px; }
    }

    /* Moving border gradient */
    @keyframes footer-border-spin {
      0%   { background-position: 0%   50%; }
      100% { background-position: 200% 50%; }
    }
    .footer-moving-border {
      background: linear-gradient(90deg, var(--clr-lime), var(--clr-mint), var(--clr-green), var(--clr-sage), var(--clr-lime));
      background-size: 300% 100%;
      animation: footer-border-spin 5s linear infinite;
    }

    /* Text shimmer */
    .footer-shimmer-text {
      background: linear-gradient(
        110deg,
        var(--clr-lime) 0%,
        var(--clr-mint) 30%,
        var(--clr-green) 50%,
        var(--clr-lime) 70%,
        var(--clr-sage) 100%
      );
      background-size: 250% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer-sweep 5s ease-in-out infinite;
    }
    @keyframes shimmer-sweep {
      0%,100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }

    /* Noise texture */
    .footer-noise::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0.03;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 180px 180px;
      mix-blend-mode: overlay;
    }

    /* Leaf float */
    @keyframes footer-leaf {
      0%,100% { transform: translateY(0) rotate(-6deg); }
      50%      { transform: translateY(-10px) rotate(6deg); }
    }

    /* Fade-up */
    @keyframes footer-fade-up {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .footer-fade-up {
      opacity: 0;
      animation: footer-fade-up 0.8s cubic-bezier(0.22,1,0.36,1) forwards;
    }

    /* Social icon hover ring */
    .footer-social:hover::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      background: conic-gradient(var(--clr-lime), var(--clr-mint), var(--clr-green), var(--clr-lime));
      animation: footer-border-spin 2s linear infinite;
      z-index: -1;
    }

    /* Dot pattern */
    .footer-dots {
      background-image: radial-gradient(circle, rgba(62,250,72,0.10) 1px, transparent 1px);
      background-size: 24px 24px;
    }
  `}</style>
);

/* ══════════════════════════════════════════════════════
   SOCIAL ICON — conic ring on hover
   ══════════════════════════════════════════════════════ */
const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <a
    href={href}
    aria-label="Social link"
    className="footer-social group relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500"
    style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.10)',
      color: 'rgba(255,255,255,0.50)',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.background = 'rgba(181,247,32,0.15)';
      el.style.borderColor = 'rgba(181,247,32,0.40)';
      el.style.color = 'var(--clr-lime)';
      el.style.transform = 'translateY(-2px) scale(1.08)';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.background = 'rgba(255,255,255,0.05)';
      el.style.borderColor = 'rgba(255,255,255,0.10)';
      el.style.color = 'rgba(255,255,255,0.50)';
      el.style.transform = 'none';
    }}
  >
    {icon}
  </a>
);

/* ══════════════════════════════════════════════════════
   FOOTER LINK — sliding arrow mechanic preserved
   ══════════════════════════════════════════════════════ */
const FooterLink = ({
  to,
  label,
  highlight = false
}: {
  to: string;
  label: string;
  highlight?: boolean;
}) => (
  <li>
    <Link
      to={to}
      className="group flex items-center gap-0 text-[13px] transition-all duration-300"
      style={{
        color: highlight ? 'var(--clr-lime)' : 'rgba(255,255,255,0.45)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontWeight: highlight ? 600 : 400,
        letterSpacing: '-0.01em',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = highlight
          ? 'var(--clr-lime)'
          : 'rgba(255,255,255,0.45)';
      }}
    >
      {/* Sliding arrow — original mechanic preserved */}
      <span className="overflow-hidden w-0 group-hover:w-4 transition-[width] duration-300 flex items-center">
        <ArrowRight size={12} strokeWidth={1.5} style={{ color: 'var(--clr-lime)', flexShrink: 0 }} />
      </span>
      <span className="group-hover:ml-1.5 transition-[margin] duration-300">{label}</span>
    </Link>
  </li>
);

/* ══════════════════════════════════════════════════════
   CONTACT ITEM
   ══════════════════════════════════════════════════════ */
const ContactItem = ({
  icon,
  text,
  href
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
}) => {
  const inner = (
    <div
      className="group flex items-start gap-3 transition-all duration-400 cursor-pointer"
      style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.42)'; }}
    >
      <span
        className="mt-0.5 shrink-0 transition-colors duration-300 group-hover:text-[var(--clr-lime)]"
        style={{ color: 'rgba(27,250,153,0.60)' }}
      >
        {icon}
      </span>
      <span className="text-[13px] leading-relaxed font-light">{text}</span>
    </div>
  );
  return href ? <a href={href} className="block">{inner}</a> : <div>{inner}</div>;
};

/* ══════════════════════════════════════════════════════
   COLUMN HEADING
   ══════════════════════════════════════════════════════ */
const ColHeading = ({ children }: { children: React.ReactNode }) => (
  <h4
    className="text-[11px] font-bold uppercase tracking-[0.22em] mb-6 flex items-center gap-3"
    style={{ color: 'var(--clr-lime)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
  >
    {children}
    <span className="flex-1 h-px" style={{ background: 'rgba(181,247,32,0.15)' }} />
  </h4>
);

/* ══════════════════════════════════════════════════════
   FOOTER — Agro-Luxury Edition
   ══════════════════════════════════════════════════════ */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <FooterStyles />

      <footer
        className="footer-retro-grid footer-noise relative mt-24 overflow-hidden"
        style={{
          background: 'var(--clr-dark)',
          color: '#f5f5f5',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}
      >

        {/* ── Atmospheric background beams ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.18 }}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="fg1" cx="15%" cy="100%" r="55%">
              <stop offset="0%" stopColor="#3EFA48" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3EFA48" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="fg2" cx="85%" cy="80%" r="45%">
              <stop offset="0%" stopColor="#1BFA99" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#1BFA99" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="fg3" cx="50%" cy="0%" r="40%">
              <stop offset="0%" stopColor="#B5F720" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#B5F720" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#fg1)" />
          <rect width="100%" height="100%" fill="url(#fg2)" />
          <rect width="100%" height="100%" fill="url(#fg3)" />
          {[...Array(6)].map((_, i) => (
            <line
              key={i}
              x1={`${8 + i * 17}%`} y1="100%"
              x2={`${12 + i * 17}%`} y2="0%"
              stroke="#3EFA48"
              strokeWidth="0.4"
              strokeOpacity={0.035 + i * 0.008}
            />
          ))}
        </svg>

        {/* ── Glow orbs ── */}
        <div
          className="absolute -bottom-20 left-16 w-96 h-96 rounded-full blur-[160px] pointer-events-none"
          style={{ background: 'rgba(62,250,72,0.06)' }}
        />
        <div
          className="absolute top-0 right-16 w-72 h-72 rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'rgba(27,250,153,0.05)' }}
        />

        {/* ── Moving border — top edge ── */}
        <div className="footer-moving-border absolute top-0 left-0 right-0 h-[1.5px]" style={{ opacity: 0.8 }} />

        {/* ── Dot strip above main content ── */}
        <div className="footer-dots relative z-10 h-14 w-full" style={{ opacity: 0.35 }} />

        {/* ══════════════════════════════
            MAIN CONTENT
            ══════════════════════════════ */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pb-12 pt-2">

          {/* ── 4-column grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">

            {/* Col 1 — Brand identity */}
            <div
              className="footer-fade-up space-y-6 p-7 rounded-[28px] relative"
              style={{
                background: 'rgba(13,31,16,0.70)',
                border: '1px solid rgba(62,250,72,0.10)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.20)',
                animationDelay: '0ms',
                animationFillMode: 'forwards',
              }}
            >
              {/* Moving border on brand card */}
              <div className="footer-moving-border absolute top-0 left-8 right-8 h-[1px] rounded-full" style={{ opacity: 0.5 }} />

              <Link to="/" className="inline-block">
                <h3
                  className="text-4xl font-bold tracking-[-0.02em] leading-none"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  <span className="text-white">Agro</span>
                  <span className="footer-shimmer-text">LK</span>
                </h3>
              </Link>

              {/* Thin divider */}
              <div className="h-px" style={{ background: 'rgba(62,250,72,0.10)' }} />

              <p className="text-[13px] leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.42)' }}>
                Connecting the world to the heart of Sri Lanka. Experience authentic
                farm stays, support rural communities, and rediscover nature in its
                purest form.
              </p>

              {/* Decorative leaf SVG */}
              <svg
                viewBox="0 0 40 40"
                className="absolute bottom-6 right-6 w-10 h-10 pointer-events-none"
                style={{ opacity: 0.10, animation: 'footer-leaf 7s ease-in-out infinite' }}
                aria-hidden="true"
              >
                <path d="M20 3C27 3 37 11 37 22C37 31 29 37 20 37C11 37 3 29 3 20C3 11 9 3 20 3Z" fill="var(--clr-lime)" />
                <line x1="20" y1="37" x2="20" y2="6" stroke="var(--clr-dark)" strokeWidth="1.5" opacity="0.5" />
                <line x1="20" y1="16" x2="29" y2="11" stroke="var(--clr-dark)" strokeWidth="1" opacity="0.4" />
                <line x1="20" y1="24" x2="30" y2="20" stroke="var(--clr-dark)" strokeWidth="1" opacity="0.4" />
              </svg>

              {/* Social icons */}
              <div className="flex gap-2.5 pt-1">
                <SocialIcon icon={<Facebook   size={16} strokeWidth={1.5} />} href="#" />
                <SocialIcon icon={<Instagram  size={16} strokeWidth={1.5} />} href="#" />
                <SocialIcon icon={<Twitter    size={16} strokeWidth={1.5} />} href="#" />
              </div>
            </div>

            {/* Col 2 — Explore */}
            <div
              className="footer-fade-up"
              style={{ animationDelay: '80ms', animationFillMode: 'forwards' }}
            >
              <ColHeading>Explore</ColHeading>
              <ul className="space-y-3.5">
                <FooterLink to="/"            label="Home" />
                <FooterLink to="/activities"  label="Farm Activities" />
                <FooterLink to="/about"       label="Our Story" />
                <FooterLink to="/contact"     label="Contact Support" />
              </ul>
            </div>

            {/* Col 3 — Join the Network */}
            <div
              className="footer-fade-up"
              style={{ animationDelay: '160ms', animationFillMode: 'forwards' }}
            >
              <ColHeading>Join the Network</ColHeading>
              <ul className="space-y-3.5">
                <FooterLink to="/register?role=farmer"    label="Become a Farmer Host"  highlight />
                <FooterLink to="/register?role=guide"     label="Register as a Guide" />
                <FooterLink to="/register?role=transport" label="List Your Vehicle" />
                <FooterLink to="/terms"                   label="Terms & Conditions" />
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div
              className="footer-fade-up"
              style={{ animationDelay: '240ms', animationFillMode: 'forwards' }}
            >
              <ColHeading>Get in Touch</ColHeading>
              <ul className="space-y-4">
                <ContactItem icon={<Mail  size={15} strokeWidth={1.4} />} text="support@agrolk.com"  href="mailto:support@agrolk.com" />
                <ContactItem icon={<Phone size={15} strokeWidth={1.4} />} text="+94 11 234 5678"     href="tel:+94112345678" />
                <ContactItem icon={<MapPin size={15} strokeWidth={1.4} />} text="Colombo, Sri Lanka" />
              </ul>
            </div>

          </div>

          {/* ── Bottom bar ── */}
          <div
            className="relative pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{ borderTop: '1px solid rgba(62,250,72,0.08)' }}
          >
            {/* Decorative glow on divider */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(181,247,32,0.35), transparent)' }}
            />

            {/* Copyright */}
            <p
              className="flex items-center gap-2 text-[12px] font-light"
              style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '-0.01em' }}
            >
              <Leaf
                size={13}
                strokeWidth={1.2}
                style={{ color: 'var(--clr-mint)', opacity: 0.55, animation: 'footer-leaf 5s ease-in-out infinite' }}
              />
              &copy; {currentYear} AgroLK. Crafted with care for Sri Lankan Tourism.
            </p>

            {/* Policy links */}
            <div className="flex items-center gap-1">
              {[
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/cookies', label: 'Cookie Policy' },
              ].map((item, i) => (
                <React.Fragment key={item.to}>
                  {i > 0 && (
                    <span
                      className="w-1 h-1 rounded-full mx-2"
                      style={{ background: 'rgba(255,255,255,0.15)' }}
                    />
                  )}
                  <Link
                    to={item.to}
                    className="text-[12px] font-light transition-colors duration-300"
                    style={{ color: 'rgba(255,255,255,0.28)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--clr-lime)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.28)'; }}
                  >
                    {item.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom fade-out ── */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(5,15,7,0.60))' }}
        />

      </footer>
    </>
  );
};

export default Footer;