import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPublicStats } from '../src/services/publicService';
import { getAIRecommendations } from '../src/services/aiService';
import ActivityCard from '../src/components/common/ActivityCard';
import { useAuth } from '../src/context/AuthContext';
import { useChat } from '../src/context/ChatContext';
import {
  Sparkles,
  Star,
  Leaf,
  Tractor,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Sprout,
  MessageCircle,
  ChevronDown,
  LucideIcon
} from 'lucide-react';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

    :root {
      --clr-lime:   #B5F720;
      --clr-mint:   #1BFA99;
      --clr-green:  #3EFA48;
      --clr-sage:   #8CFA98;
      --clr-dark:   #050f07;
      --clr-ink:    #0d1f10;
    }

    /* ── Dot-grid atmosphere ── */
    .agro-dot-bg {
      background-image: radial-gradient(circle, rgba(62,250,72,0.13) 1px, transparent 1px);
      background-size: 28px 28px;
    }

    /* ── Animated retro grid ── */
    .retro-grid::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(62,250,72,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(62,250,72,0.06) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
      animation: grid-drift 20s linear infinite;
    }
    @keyframes grid-drift {
      0%   { background-position: 0 0; }
      100% { background-position: 60px 60px; }
    }

    /* ── Shimmer button effect ── */
    .shimmer-btn::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.28) 50%, transparent 60%);
      background-size: 200% 100%;
      background-position: -100% 0;
      transition: background-position 0.55s ease;
    }
    .shimmer-btn:hover::after {
      background-position: 100% 0;
    }

    /* ── Text shimmer ── */
    .text-shimmer {
      background: linear-gradient(
        110deg,
        var(--clr-lime) 0%,
        var(--clr-mint) 35%,
        var(--clr-green) 50%,
        var(--clr-lime) 65%,
        var(--clr-sage) 100%
      );
      background-size: 250% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer-flow 4s ease-in-out infinite;
    }
    @keyframes shimmer-flow {
      0%,100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }

    /* ── Slow hero pan ── */
    @keyframes hero-pan {
      0%,100% { transform: scale(1.08) translateX(0);   }
      50%      { transform: scale(1.12) translateX(-1%); }
    }

    /* ── Fade-up reveal ── */
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up {
      opacity: 0;
      animation: fade-up 0.85s cubic-bezier(0.22,1,0.36,1) forwards;
    }

    /* ── Pulse ring ── */
    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity: 0.6; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    /* ── Moving border gradient ── */
    @keyframes border-spin {
      0%   { background-position: 0%   50%; }
      100% { background-position: 200% 50%; }
    }
    .moving-border {
      background: linear-gradient(90deg, var(--clr-lime), var(--clr-mint), var(--clr-green), var(--clr-lime));
      background-size: 200% 100%;
      animation: border-spin 3s linear infinite;
    }

    /* ── Bento hover ── */
    .bento-card {
      transition: transform 0.7s cubic-bezier(0.23,1,0.32,1),
                  box-shadow 0.7s cubic-bezier(0.23,1,0.32,1);
    }
    .bento-card:hover {
      transform: scale(1.02) translateY(-4px);
      box-shadow: 0 32px 80px rgba(62,250,72,0.10), 0 8px 24px rgba(0,0,0,0.18);
    }

    /* ── Noise texture overlay ── */
    .noise::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0.035;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 200px 200px;
      mix-blend-mode: overlay;
    }

    /* ── Leaf float ── */
    @keyframes leaf-float {
      0%,100% { transform: translateY(0) rotate(-5deg);  }
      50%      { transform: translateY(-12px) rotate(5deg); }
    }

    /* scrollbar hidden utility */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

const FadeIn = ({
  children,
  delay = 0,
  className = ''
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <div
    className={`fade-up ${className}`}
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
  >
    {children}
  </div>
);

const ShimmerButton = ({
  children,
  onClick,
  variant = 'primary',
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  className?: string;
}) => {
  const base =
    'shimmer-btn relative inline-flex items-center justify-center gap-2.5 overflow-hidden font-semibold tracking-tight transition-all duration-500 select-none cursor-pointer';
  const variants: Record<string, string> = {
    primary:
      'bg-[var(--clr-lime)] text-[var(--clr-dark)] rounded-2xl px-7 py-3.5 text-[15px] shadow-[0_0_32px_rgba(181,247,32,0.35)] hover:shadow-[0_0_48px_rgba(181,247,32,0.55)] hover:-translate-y-0.5 active:scale-[0.98]',
    ghost:
      'bg-white/10 backdrop-blur-xl border border-white/25 text-white rounded-2xl px-7 py-3.5 text-[15px] hover:bg-white/18 hover:-translate-y-0.5 active:scale-[0.98]',
    outline:
      'bg-transparent border border-white/25 text-white rounded-2xl px-7 py-3.5 text-[15px] hover:border-[var(--clr-lime)]/50 hover:text-[var(--clr-lime)] hover:-translate-y-0.5 active:scale-[0.98]',
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const BackgroundBeams = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="b1" cx="20%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#3EFA48" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#3EFA48" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="b2" cx="80%" cy="20%" r="50%">
        <stop offset="0%" stopColor="#1BFA99" stopOpacity="0.14" />
        <stop offset="100%" stopColor="#1BFA99" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="b3" cx="65%" cy="80%" r="45%">
        <stop offset="0%" stopColor="#B5F720" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#B5F720" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#b1)" />
    <rect width="100%" height="100%" fill="url(#b2)" />
    <rect width="100%" height="100%" fill="url(#b3)" />
    {/* Beam lines */}
    {[...Array(7)].map((_, i) => (
      <line
        key={i}
        x1={`${10 + i * 14}%`} y1="0%"
        x2={`${5 + i * 14}%`}  y2="100%"
        stroke="#3EFA48"
        strokeWidth="0.5"
        strokeOpacity={0.04 + i * 0.01}
      />
    ))}
  </svg>
);

const StatItem = ({
  value,
  label,
  icon: Icon,
  accent
}: {
  value: string | number;
  label: string;
  icon: LucideIcon;
  accent: string;
}) => (
  <div className="group flex flex-col items-center gap-3 px-4 py-6 rounded-[24px] hover:bg-white/5 transition-all duration-500">
    <div
      className="relative w-12 h-12 rounded-xl flex items-center justify-center"
      style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
    >
      <Icon size={22} strokeWidth={1.2} style={{ color: accent }} />
      {/* Pulse ring */}
      <span
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'transparent',
          border: `1px solid ${accent}`,
          animation: 'pulse-ring 2.5s ease-out infinite',
        }}
      />
    </div>
    <p
      className="text-5xl font-bold leading-none tabular-nums tracking-tight"
      style={{ fontFamily: 'Playfair Display, serif', color: accent }}
    >
      {value}
    </p>
    <p className="text-white/45 text-[10px] font-semibold uppercase tracking-[0.22em] text-center leading-tight">
      {label}
    </p>
  </div>
);

const BentoFeatureCard = ({
  icon: Icon,
  title,
  description,
  accent,
  tag,
  size = 'normal'
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  tag: string;
  size?: 'normal' | 'tall';
}) => (
  <div
    className={`bento-card noise relative rounded-[32px] overflow-hidden flex flex-col justify-between p-8 md:p-10 ${size === 'tall' ? 'md:row-span-2' : ''}`}
    style={{
      background: 'rgba(13,31,16,0.85)',
      border: '1px solid rgba(62,250,72,0.10)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.30)',
    }}
  >
    {/* Moving border glow on top edge */}
    <div
      className="moving-border absolute top-0 left-0 right-0 h-[1.5px]"
      style={{ opacity: 0.7 }}
    />

    {/* Ambient blob */}
    <div
      className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
      style={{ background: accent }}
    />

    <div className="relative z-10">
      {/* Tag pill */}
      <span
        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6"
        style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}25` }}
      >
        {tag}
      </span>

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
        style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}
      >
        <Icon size={26} strokeWidth={1.2} style={{ color: accent }} />
      </div>

      <h3
        className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        {title}
      </h3>
      <p className="text-white/50 text-[14px] leading-relaxed font-light" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {description}
      </p>
    </div>

    {/* Bottom accent line */}
    <div className="relative z-10 mt-10 h-px" style={{ background: `linear-gradient(90deg, ${accent}50, transparent)` }} />
  </div>
);

const RecoCard = ({ item, index }: { item: any; index: number }) => (
  <FadeIn delay={index * 80}>
    <a
      href={`/activities/${item.id}`}
      className="bento-card noise group relative flex flex-col rounded-[28px] overflow-hidden h-full"
      style={{
        background: 'rgba(13,31,16,0.90)',
        border: '1px solid rgba(62,250,72,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        textDecoration: 'none',
      }}
    >
      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[28px]"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(181,247,32,0.06) 0%, transparent 70%)' }}
      />

      {/* Score badge */}
      <div className="relative z-10 flex items-start justify-between p-7 pb-0">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(181,247,32,0.12)', color: 'var(--clr-lime)', border: '1px solid rgba(181,247,32,0.20)' }}
        >
          <Sparkles size={11} strokeWidth={1.5} />
          {Math.round(item.score * 100)}% match
        </span>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110"
          style={{ background: 'rgba(62,250,72,0.08)', border: '1px solid rgba(62,250,72,0.15)' }}
        >
          <MapPin size={15} strokeWidth={1.2} className="text-white/40 group-hover:text-[#3EFA48] transition-colors duration-500" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col flex-1 p-7 pt-5">
        <h3
          className="text-xl font-bold text-white mb-3 leading-snug line-clamp-2 group-hover:text-[#B5F720] transition-colors duration-500"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {item.title}
        </h3>
        <p className="text-white/40 text-[13px] leading-relaxed line-clamp-3 flex-1 font-light" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {item.reason}
        </p>

        <div
          className="mt-6 flex items-center gap-2 text-[13px] font-semibold text-white/50 group-hover:text-[#3EFA48] transition-all duration-500"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          View details
          <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-500" />
        </div>
      </div>

      {/* Bottom moving line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: 'linear-gradient(90deg, transparent, var(--clr-lime), transparent)' }}
      />
    </a>
  </FadeIn>
);

const SectionPill = ({ children, icon: Icon }: { children: React.ReactNode; icon?: LucideIcon }) => (
  <span
    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-5"
    style={{
      background: 'rgba(62,250,72,0.10)',
      color: 'var(--clr-lime)',
      border: '1px solid rgba(62,250,72,0.20)',
    }}
  >
    {Icon && <Icon size={12} strokeWidth={2} />}
    {children}
  </span>
);

const Divider = () => (
  <div className="flex items-center justify-center gap-4 mt-6">
    <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(181,247,32,0.4))' }} />
    <div
      className="w-1.5 h-1.5 rotate-45"
      style={{ background: 'var(--clr-lime)', opacity: 0.6 }}
    />
    <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, rgba(181,247,32,0.4), transparent)' }} />
  </div>
);

const FloatingLeaf = ({ className = '', delay = 0, scale = 1 }: { className?: string; delay?: number; scale?: number }) => (
  <svg
    viewBox="0 0 48 48"
    className={`absolute pointer-events-none ${className}`}
    style={{
      width: 48 * scale,
      height: 48 * scale,
      animation: `leaf-float 6s ease-in-out ${delay}ms infinite`,
      opacity: 0.12,
    }}
    aria-hidden="true"
  >
    <path
      d="M24 4 C32 4 44 14 44 26 C44 36 34 44 24 44 C14 44 4 34 4 24 C4 14 12 4 24 4Z"
      fill="var(--clr-lime)"
    />
    <line x1="24" y1="44" x2="24" y2="8" stroke="var(--clr-dark)" strokeWidth="1.5" opacity="0.4" />
    <line x1="24" y1="20" x2="34" y2="14" stroke="var(--clr-dark)" strokeWidth="1" opacity="0.3" />
    <line x1="24" y1="28" x2="36" y2="24" stroke="var(--clr-dark)" strokeWidth="1" opacity="0.3" />
    <line x1="24" y1="20" x2="14" y2="14" stroke="var(--clr-dark)" strokeWidth="1" opacity="0.3" />
  </svg>
);

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    getPublicStats()
      .then(res => setStats(res.data))
      .catch(console.error);

    if (user) {
      console.log('👤 Logged in user:', user.email, user.countryOfResidence);
      getAIRecommendations()
        .then(res => {
          console.log('🤖 AI Response:', res);
          if (res.success) setRecommendations(res.data);
        })
        .catch(err => console.error('❌ AI Fetch Error:', err));
    }
  }, [user]);

  /* ── render ── */
  return (
    <div
      className="min-h-screen selection:bg-[#3EFA48]/20 selection:text-[#3EFA48]"
      style={{
        background: 'var(--clr-dark)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        color: '#f5f5f5',
      }}
    >
      <GlobalStyles />

      <section className="relative w-full min-h-screen overflow-hidden flex flex-col">

        {/* Background image with slow pan */}
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/1920/1080"
            alt="Sri Lankan Tea Plantation"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ animation: 'hero-pan 28s ease-in-out infinite' }}
          />
          {/* Layered overlays */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,15,7,0.55) 0%, rgba(5,15,7,0.25) 40%, rgba(5,15,7,0.85) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(5,15,7,0.75) 0%, transparent 65%)' }} />
        </div>

        {/* Retro grid layer */}
        <div className="retro-grid absolute inset-0 pointer-events-none" />

        {/* Beam ambience */}
        <BackgroundBeams />

        {/* Decorative floating leaves */}
        <FloatingLeaf className="top-28 right-32" delay={0} scale={1.4} />
        <FloatingLeaf className="top-56 right-72" delay={1200} scale={0.8} />
        <FloatingLeaf className="bottom-48 right-24" delay={600} scale={1.1} />

        {/* Glow orbs */}
        <div
          className="absolute top-24 right-48 w-80 h-80 rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'rgba(62,250,72,0.07)' }}
        />
        <div
          className="absolute bottom-32 left-24 w-96 h-96 rounded-full blur-[150px] pointer-events-none"
          style={{ background: 'rgba(27,250,153,0.05)' }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 py-16 pt-32">
          <div className="max-w-3xl">

            {/* Premium badge */}
            <FadeIn delay={0}>
              <span
                className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] px-5 py-2.5 rounded-full mb-10"
                style={{
                  background: 'rgba(181,247,32,0.10)',
                  color: 'var(--clr-lime)',
                  border: '1px solid rgba(181,247,32,0.25)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <Leaf size={13} strokeWidth={1.5} style={{ animation: 'leaf-float 3s ease-in-out infinite' }} />
                #1 Rural Tourism Platform · Sri Lanka
              </span>
            </FadeIn>

            {/* Headline */}
            <FadeIn delay={120}>
              <h1
                className="text-6xl sm:text-7xl md:text-8xl font-bold leading-[0.92] tracking-tight mb-8"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <span className="block text-white">Experience</span>
                <span className="block">
                  <em className="text-shimmer not-italic">Authentic</em>
                </span>
                <span className="block text-white/80">Farm Life.</span>
              </h1>
            </FadeIn>

            {/* Sub-headline */}
            <FadeIn delay={240}>
              <p className="text-lg sm:text-xl text-white/60 max-w-xl font-light leading-relaxed mb-12 tracking-tight">
                Escape the ordinary. Book immersive farm stays, harvest experiences,
                and village tours — directly from local cultivators.
              </p>
            </FadeIn>

            {/* CTA row */}
            <FadeIn delay={360}>
              <div className="flex flex-col sm:flex-row gap-3.5 flex-wrap">

                <ShimmerButton
                  variant="primary"
                  onClick={() => navigate('/activities')}
                >
                  <span>Explore Activities</span>
                  <ArrowRight size={17} strokeWidth={2} className="group-hover:translate-x-1 transition-transform duration-500" />
                </ShimmerButton>

                <ShimmerButton variant="ghost" onClick={() => navigate('/trip-wizard')}>
                  <Sparkles size={16} strokeWidth={1.5} style={{ color: 'var(--clr-lime)' }} />
                  <span>Plan with AI</span>
                </ShimmerButton>

                <Link to="/wisdom-hub" className="contents">
                  <ShimmerButton variant="outline">
                    <MessageCircle size={16} strokeWidth={1.5} />
                    <span>Agro Wisdom Hub</span>
                  </ShimmerButton>
                </Link>

              </div>
            </FadeIn>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex flex-col items-center gap-2 pb-10 mt-auto">
          <span className="text-white/30 text-[10px] tracking-[0.28em] uppercase">Scroll</span>
          <div
            className="w-6 h-10 rounded-full flex items-start justify-center pt-2"
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ChevronDown size={14} className="text-white/40 animate-bounce" />
          </div>
        </div>
      </section>

      {stats && (
        <section className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 -mt-20">
          <FadeIn delay={80}>
            <div
              className="noise relative rounded-[32px] overflow-hidden"
              style={{
                background: 'rgba(13,31,16,0.92)',
                border: '1px solid rgba(62,250,72,0.12)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.50), 0 0 0 0.5px rgba(62,250,72,0.08)',
              }}
            >
              {/* Top gradient bar */}
              <div
                className="moving-border absolute top-0 left-0 right-0 h-[1.5px]"
              />

              <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
                <StatItem value={`${stats.totalFarms}+`}      label="Active Farms"    icon={Tractor} accent="var(--clr-green)" />
                <StatItem value={`${stats.totalActivities}+`} label="Experiences"     icon={Leaf}    accent="var(--clr-lime)" />
                <StatItem value={`${stats.totalReviews}+`}    label="Happy Guests"    icon={Sprout}  accent="var(--clr-mint)" />

                {/* Rating */}
                <div className="flex flex-col items-center gap-3 px-4 py-6">
                  <div className="flex items-center gap-2">
                    <Star size={22} strokeWidth={1.2} style={{ fill: 'var(--clr-lime)', color: 'var(--clr-lime)' }} />
                    <p
                      className="text-5xl font-bold leading-none tabular-nums tracking-tight"
                      style={{ fontFamily: 'Playfair Display, serif', color: 'var(--clr-lime)' }}
                    >
                      {stats.averageRating}
                    </p>
                  </div>
                  <p className="text-white/45 text-[10px] font-semibold uppercase tracking-[0.22em]">Average Rating</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={9} strokeWidth={1} style={{ fill: 'rgba(181,247,32,0.25)', color: 'rgba(181,247,32,0.25)' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      )}

      {user && recommendations?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20">

          <FadeIn delay={0}>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">

              <div className="max-w-xl">
                <SectionPill icon={Sparkles}>AI Curation</SectionPill>
                <h2
                  className="text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Picked Just<br />
                  <em className="text-shimmer not-italic">For You</em>
                </h2>
                <Divider />
              </div>

              <p className="text-white/40 text-sm max-w-xs leading-relaxed font-light">
                Curated based on your origin{' '}
                <span
                  className="font-semibold px-2 py-0.5 rounded-lg"
                  style={{ background: 'rgba(62,250,72,0.10)', color: 'var(--clr-lime)' }}
                >
                  {user.countryOfResidence || 'Global'}
                </span>
                {' '}and unique taste profile.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendations.map((item: any, i: number) => (
              <RecoCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-36 overflow-hidden">

        {/* Atmospheric dots */}
        <div className="agro-dot-bg absolute inset-0 pointer-events-none opacity-40" />

        {/* Background orbs */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none"
          style={{ background: 'rgba(62,250,72,0.04)' }}
        />
        <div
          className="absolute -bottom-24 right-0 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none"
          style={{ background: 'rgba(27,250,153,0.04)' }}
        />

        {/* Section header */}
        <div className="text-center mb-20 relative z-10">
          <FadeIn delay={0}>
            <SectionPill icon={ShieldCheck}>Why Choose Us</SectionPill>
            <h2
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Why Travellers Choose
              <br />
              <span className="text-shimmer">AgroLK</span>
            </h2>
            <Divider />
          </FadeIn>
        </div>

        {/* Asymmetric Bento grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FadeIn delay={100} className="lg:col-span-1">
            <BentoFeatureCard
              icon={Sprout}
              title="Direct Farmer Support"
              description="100% of your activity fee goes directly to rural farmers, empowering local communities and sustaining heritage agriculture practices for future generations."
              accent="var(--clr-green)"
              tag="Community"
            />
          </FadeIn>

          <FadeIn delay={180} className="lg:col-span-1">
            <BentoFeatureCard
              icon={Tractor}
              title="Integrated Booking"
              description="Seamlessly book your farm visit, professional tour guide, and rural transport in a single secure, verified transaction with real-time availability."
              accent="var(--clr-lime)"
              tag="Seamless"
            />
          </FadeIn>

          <FadeIn delay={260} className="lg:col-span-1">
            <BentoFeatureCard
              icon={ShieldCheck}
              title="Verified Providers"
              description="Every farmer, guide, and driver undergoes rigorous manual vetting by our expert team to ensure your safety, comfort, and absolute peace of mind."
              accent="var(--clr-mint)"
              tag="Verified"
            />
          </FadeIn>
        </div>

        {/* Trust bar */}
        <FadeIn delay={340}>
          <div className="mt-16 relative z-10 flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { icon: ShieldCheck, label: 'Secure Payments',   accent: 'var(--clr-green)' },
              { icon: Star,        label: '4.9 / 5 Rating',    accent: 'var(--clr-lime)'  },
              { icon: Leaf,        label: 'Eco-Certified',     accent: 'var(--clr-mint)'  },
            ].map(({ icon: Icon, label, accent }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon size={17} strokeWidth={1.5} style={{ color: accent }} />
                <span className="text-white/45 text-[13px] font-medium tracking-tight">{label}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      <section className="relative overflow-hidden py-24 px-6">
        {/* Full-width gradient banner */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(62,250,72,0.08) 0%, rgba(27,250,153,0.05) 50%, rgba(181,247,32,0.08) 100%)',
            borderTop: '1px solid rgba(62,250,72,0.10)',
            borderBottom: '1px solid rgba(62,250,72,0.10)',
          }}
        />
        <div className="agro-dot-bg absolute inset-0 opacity-30 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn delay={0}>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] mb-4" style={{ color: 'var(--clr-lime)' }}>
              Begin Your Journey
            </p>
            <h2
              className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white tracking-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              The Farm Awaits.
            </h2>
            <p className="text-white/45 text-[15px] leading-relaxed mb-10 max-w-md mx-auto font-light">
              Thousands of travellers have already discovered Sri Lanka's heartland. Your story starts now.
            </p>
            <ShimmerButton variant="primary" onClick={() => navigate('/activities')} className="mx-auto">
              Explore All Experiences
              <ArrowRight size={17} strokeWidth={2} />
            </ShimmerButton>
          </FadeIn>
        </div>
      </section>

    </div>
  );
};

export default Home;