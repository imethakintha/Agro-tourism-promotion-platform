import React, { useEffect, useState } from 'react';
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

/* ─────────────────────────────────────────────
   ENHANCED ANIMATION HELPER — preserved logic
   ───────────────────────────────────────────── */
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
    className={`animate-fade-in opacity-0 ${className}`}
    style={{
      animationDelay: `${delay}ms`,
      animationFillMode: 'forwards',
      animationDuration: '0.7s',
      animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
    }}
  >
    {children}
  </div>
);

/* ─────────────────────────────────────────────
   ENHANCED STAT ITEM — premium glass aesthetic
   ───────────────────────────────────────────── */
const StatItem = ({
  value,
  label,
  icon: Icon,
  colorClass
}: {
  value: string | number;
  label: string;
  icon: LucideIcon;
  colorClass: string;
}) => (
  <div className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/40 transition-all duration-500">
    <div className={`p-3 rounded-xl bg-linear-to-br from-white/60 to-white/20 backdrop-blur-sm shadow-sm ${colorClass} mb-1 group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={20} strokeWidth={1.5} />
    </div>
    <p className={`text-4xl md:text-5xl font-serif font-bold ${colorClass} tabular-nums tracking-tight leading-none`}>
      {value}
    </p>
    <p className="text-neutral/60 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-center leading-tight">
      {label}
    </p>
  </div>
);

/* ─────────────────────────────────────────────
   PREMIUM FEATURE CARD — 3D hover effects
   ───────────────────────────────────────────── */
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  accentBg,
  accentHover,
  iconColor,
  iconHoverColor,
  borderHover
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accentBg: string;
  accentHover: string;
  iconColor: string;
  iconHoverColor: string;
  borderHover: string;
}) => (
  <div
    className={`group relative bg-white rounded-4xl p-8 md:p-10 border border-slate-100/80 ${borderHover}
                shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)]
                transition-all duration-700 ease-out overflow-hidden hover:-translate-y-2`}
  >
    {/* Animated gradient background */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-linear-to-br ${accentBg} to-transparent`} />

    {/* Decorative floating circles */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-linear-to-br from-primary/5 to-secondary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-linear-to-tr from-secondary/5 to-primary/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-1000 delay-100" />

    <div className="relative z-10">
      {/* Icon container with 3D effect */}
      <div
        className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-6
                    bg-linear-to-br from-slate-50 to-white shadow-inner
                    group-hover:shadow-lg group-hover:shadow-primary/10
                    ${accentHover} transition-all duration-500 transform group-hover:scale-105 group-hover:rotate-1`}
      >
        <Icon
          size={32}
          strokeWidth={1.5}
          className={`${iconColor} ${iconHoverColor} transition-all duration-500 transform group-hover:scale-110`}
        />

        {/* Subtle shine effect */}
        <div className="absolute inset-0 rounded-2xl bg-linear-to-tr from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-800 mb-3 relative z-10 group-hover:text-primary transition-colors duration-500">
        {title}
      </h3>
      <p className="text-slate-500/80 text-sm md:text-[15px] leading-relaxed relative z-10 font-light">
        {description}
      </p>

      {/* Animated underline */}
      <div className="mt-6 h-0.5 w-0 group-hover:w-12 bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-700 ease-out" />
    </div>
  </div>
);

/* ═════════════════════════════════════════════
   REFACTORED HOME PAGE — Agro-Luxury Edition
   ═════════════════════════════════════════════ */
const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  /* ── PRESERVED LOGIC: data fetching ── */
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
    <div className="min-h-screen bg-bg-white font-sans text-slate-800 selection:bg-primary/20 selection:text-primary">

      {/* ╔══════════════════════════════════════════
          ║  HERO SECTION — Cinematic Glassmorphism
          ╚══════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen overflow-hidden bg-dark">

        {/* Parallax background with overlay */}
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/1920/1080"
            alt="Sri Lankan Tea Plantation"
            className="absolute inset-0 w-full h-full object-cover scale-105 animate-[slow-zoom_25s_linear_infinite]"
          />
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-dark/60 via-dark/20 to-dark/80" />
          <div className="absolute inset-0 bg-linear-to-r from-primary/80 via-primary/30 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(4,31,12,0.4)_100%)]" />
        </div>

        {/* Floating organic shapes (decorative) */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Content container */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-12">
          <div className="max-w-2xl">

            {/* Premium badge */}
            <FadeIn delay={0}>
              <span className="inline-flex items-center gap-2 py-2 px-5 rounded-full
                               bg-white/10 backdrop-blur-xl border border-white/30
                               text-white text-xs font-semibold tracking-widest uppercase mb-8
                               shadow-lg shadow-black/10 hover:bg-white/15 transition-all duration-500">
                <Leaf size={14} className="text-secondary animate-bounce" />
                #1 Rural Tourism Platform in Sri Lanka
              </span>
            </FadeIn>

            {/* Hero headline with text shadow */}
            <FadeIn delay={150}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-6xl
                             font-serif font-bold text-white leading-[0.95] tracking-tight mb-6
                             drop-shadow-2xl">
                Experience<br />
                <span className="relative inline-block">
                  <span className="text-secondary">Authentic</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary/30" viewBox="0 0 200 9" fill="none">
                    <path d="M2.00025 6.99997C25.7509 9.37499 85.7509 9.37498 200 3.37497" stroke="currentColor" strokeWidth="3" />
                  </svg>
                </span>
                <br />
                <span className="text-white/90">Farm Life</span>
              </h1>
            </FadeIn>

            {/* Sub-headline with improved readability */}
            <FadeIn delay={300}>
              <p className="text-lg sm:text-xl md:text-xl text-white/85 max-w-xl
                             font-light leading-relaxed mb-10 drop-shadow-lg">
                Escape the ordinary. Book immersive farm stays, harvest experiences,
                and village tours — directly from local cultivators.
              </p>
            </FadeIn>

            {/* CTA row with premium buttons */}
            <FadeIn delay={450}>
              <div className="flex flex-col sm:flex-row gap-4">

                {/* Primary CTA — Golden accent */}
                <button
                  onClick={() => navigate('/activities')}
                  className="group relative inline-flex items-center justify-center gap-3
                             bg-secondary text-dark font-bold text-base px-8 py-4 rounded-2xl
                             shadow-xl shadow-secondary/25 overflow-hidden
                             hover:shadow-2xl hover:shadow-secondary/40 hover:-translate-y-1 
                             transition-all duration-500"
                >
                  <span className="relative z-10">Explore Activities</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/30 to-transparent" />
                </button>

                {/* Secondary CTA — Glass effect */}
                <button
                  onClick={() => navigate('/trip-wizard')}
                  className="group inline-flex items-center justify-center gap-3
                             bg-white/10 backdrop-blur-xl border border-white/40 text-white
                             font-semibold text-base px-8 py-4 rounded-2xl
                             hover:bg-white/20 hover:border-white/60 hover:scale-105
                             transition-all duration-500 shadow-lg shadow-black/5"
                >
                  <Sparkles size={18} className="text-secondary group-hover:rotate-12 transition-transform duration-500" />
                  Plan with AI
                </button>

                {/* Tertiary CTA — Outline glass */}
                <Link to="/wisdom-hub" className="contents">
                  <button
                    className="group inline-flex items-center justify-center gap-3
                               bg-transparent backdrop-blur-md border border-white/30 text-white
                               font-semibold text-base px-8 py-4 rounded-2xl
                               hover:bg-white/10 hover:border-white/50 hover:scale-105
                               transition-all duration-500"
                  >
                    <MessageCircle size={18} className="text-secondary group-hover:scale-110 transition-transform duration-300" />
                    Agro Wisdom Hub
                  </button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Scroll indicator with animation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-white/50 text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={24} className="text-white/60 animate-bounce" />
        </div>
      </section>

      {/* ╔══════════════════════════════════════════
          ║  FLOATING STATS BAR — Glassmorphism
          ╚══════════════════════════════════════════ */}
      {stats && (
        <section className="relative z-30 max-w-5xl mx-auto px-2 -mt-25 sm:-mt-21">
          <FadeIn delay={100}>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/60
                            rounded-4xl shadow-xl shadow-primary/10 
                            px-8 py-8 md:px-12 md:py-5 overflow-hidden">
              {/* Subtle gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-secondary to-primary opacity-60" />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative z-10">
                <StatItem
                  value={`${stats.totalFarms}+`}
                  label="Active Farms"
                  icon={Tractor}
                  colorClass="text-primary"
                />
                <StatItem
                  value={`${stats.totalActivities}+`}
                  label="Experiences"
                  icon={Leaf}
                  colorClass="text-secondary"
                />
                <StatItem
                  value={`${stats.totalReviews}+`}
                  label="Happy Guests"
                  icon={Sprout}
                  colorClass="text-primary"
                />

                {/* Rating with animated stars */}
                <div className="group flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/40 transition-all duration-500">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={24} className="fill-secondary text-secondary animate-pulse" />
                    <p className="text-4xl md:text-5xl font-serif font-bold text-secondary tabular-nums tracking-tight">
                      {stats.averageRating}
                    </p>
                  </div>
                  <p className="text-neutral/60 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em]">
                    Average Rating
                  </p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className="fill-secondary/30 text-secondary/30" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      )}

      {/* ╔══════════════════════════════════════════
          ║  AI RECOMMENDATIONS — Premium Cards
          ╚══════════════════════════════════════════ */}
      {user && recommendations?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

          {/* Section header with decorative elements */}
          <FadeIn delay={0}>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-2 bg-linear-to-r from-secondary/20 to-secondary/5 
                                   text-secondary text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider
                                   border border-secondary/20 shadow-sm">
                    <Sparkles size={14} className="animate-spin-slow" />
                    AI Curation
                  </span>
                  <div className="h-px flex-1 bg-linear-to-r from-secondary/30 to-transparent max-w-25" />
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 leading-[1.1]">
                  Picked Just For <span className="text-primary italic">You</span>
                </h2>
              </div>
              <p className="text-slate-500 text-sm md:text-base max-w-sm md:text-right leading-relaxed">
                Curated based on your origin{' '}
                <span className="font-semibold text-primary bg-primary/5 px-2 py-1 rounded-lg">
                  {user.countryOfResidence || 'Global'}
                </span>{' '}
                and unique taste profile.
              </p>
            </div>
          </FadeIn>

          {/* Recommendation grid with hover effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {recommendations.map((item: any, i: number) => (
              <FadeIn key={item.id} delay={i * 100}>
                <div className="group relative bg-white rounded-4xl border border-slate-100
                                shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
                                hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)]
                                hover:-translate-y-3 transition-all duration-700 ease-out
                                h-full flex flex-col overflow-hidden">

                  {/* Gradient accent top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />

                  {/* Decorative blob */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-subtle-accent/10 rounded-full blur-3xl group-hover:bg-subtle-accent/20 transition-colors duration-700" />

                  <div className="relative z-10 p-6 md:p-7 flex flex-col h-full">

                    {/* Match percentage badge */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="inline-flex items-center gap-1.5 
                                       bg-linear-to-r from-subtle-accent/20 to-primary/10 
                                       text-primary text-xs font-bold
                                       px-3 py-1.5 rounded-full border border-subtle-accent/20">
                        <Sparkles size={12} className="text-subtle-accent" />
                        {Math.round(item.score * 100)}% Match
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <MapPin size={14} />
                      </div>
                    </div>

                    {/* Title with hover color change */}
                    <h3 className="font-serif font-bold text-xl text-slate-800 leading-tight mb-3
                                   group-hover:text-primary transition-colors duration-500 line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Reason text */}
                    <p className="text-sm text-slate-500/90 leading-relaxed line-clamp-3 mb-6 grow">
                      {item.reason}
                    </p>

                    {/* Footer with animated link */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-auto">
                      <a
                        href={`/activities/${item.id}`}
                        className="text-sm font-semibold text-slate-700 flex items-center gap-2
                                   group-hover:text-primary group-hover:gap-3 transition-all duration-500"
                      >
                        View Details
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-500" />
                      </a>

                      {/* Micro-interaction indicator */}
                      <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-secondary group-hover:scale-150 transition-all duration-500" />
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* ╔══════════════════════════════════════════
          ║  WHY CHOOSE AGRO-LK — Luxury Features
          ╚══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative">

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        {/* Section header with luxury styling */}
        <div className="text-center mb-20 relative z-10">
          <FadeIn delay={0}>
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary
                             text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6
                             border border-primary/20 shadow-sm">
              <ShieldCheck size={14} strokeWidth={2.5} />
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-800 mb-6 leading-tight">
              Why Travellers Choose<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                AgroLK
              </span>
            </h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="h-px w-16 bg-linear-to-r from-transparent to-secondary/50" />
              <div className="w-2 h-2 rounded-full bg-secondary rotate-45" />
              <div className="h-px w-16 bg-linear-to-l from-transparent to-secondary/50" />
            </div>
          </FadeIn>
        </div>

        {/* 3-column feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <FadeIn delay={100}>
            <FeatureCard
              icon={Sprout}
              title="Direct Farmer Support"
              description="100% of your activity fee goes directly to rural farmers, empowering local communities and sustaining heritage agriculture practices for future generations."
              accentBg="from-primary/10"
              accentHover="group-hover:from-primary group-hover:to-primary/80"
              iconColor="text-primary"
              iconHoverColor="group-hover:text-white"
              borderHover="hover:border-primary/30"
            />
          </FadeIn>

          <FadeIn delay={200}>
            <FeatureCard
              icon={Tractor}
              title="Integrated Booking"
              description="Seamlessly book your farm visit, professional tour guide, and rural transport in a single secure, verified transaction with real-time availability."
              accentBg="from-secondary/10"
              accentHover="group-hover:from-secondary group-hover:to-secondary/80"
              iconColor="text-secondary"
              iconHoverColor="group-hover:text-white"
              borderHover="hover:border-secondary/40"
            />
          </FadeIn>

          <FadeIn delay={300}>
            <FeatureCard
              icon={ShieldCheck}
              title="Verified Providers"
              description="Every farmer, guide, and driver undergoes rigorous manual vetting by our expert team to ensure your safety, comfort, and absolute peace of mind."
              accentBg="from-subtle-accent/10"
              accentHover="group-hover:from-subtle-accent group-hover:to-subtle-accent/80"
              iconColor="text-subtle-accent"
              iconHoverColor="group-hover:text-white"
              borderHover="hover:border-subtle-accent/40"
            />
          </FadeIn>
        </div>

        {/* Bottom trust indicator */}
        <FadeIn delay={400}>
          <div className="mt-20 flex flex-wrap items-center justify-center gap-8 text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-2">
              <Star size={18} className="text-secondary" />
              <span className="text-sm font-medium">4.9/5 Rating</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-2 sm:flex">
              <Leaf size={18} className="text-subtle-accent" />
              <span className="text-sm font-medium">Eco-Certified</span>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Add this to your index.css for the slow zoom animation */}
      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1.05); }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default Home;