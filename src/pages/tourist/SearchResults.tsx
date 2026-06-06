import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchActivities, SearchParams } from '../../services/searchService';
import { getCategories } from '../../services/activityService';
import ActivityCard from '../../components/common/ActivityCard';
import FilterSidebar from '../../components/tourist/FilterSidebar';
import { Search, SlidersHorizontal, Loader2, ChevronDown, Sparkles } from 'lucide-react';

/* ══════════════════════════════════════════════════════
   CARD ANIMATION CSS — injected once (logic preserved)
   ══════════════════════════════════════════════════════ */
const CARD_ANIMATION_CSS = `
  @keyframes cardReveal {
    0%  { opacity: 0; transform: translateY(18px) scale(0.97); }
    100%{ opacity: 1; transform: translateY(0)    scale(1);    }
  }
  .card-reveal {
    opacity: 0;
    animation: cardReveal 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
  }
`;

/* ══════════════════════════════════════════════════════
   GLOBAL PAGE STYLES
   ══════════════════════════════════════════════════════ */
const PageStyles = () => (
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

    /* Retro grid drift */
    .sr-retro-grid::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(62,250,72,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(62,250,72,0.04) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
      animation: sr-grid-drift 22s linear infinite;
      pointer-events: none;
    }
    @keyframes sr-grid-drift {
      0%   { background-position: 0 0; }
      100% { background-position: 56px 56px; }
    }

    /* Moving border */
    @keyframes sr-border-spin {
      0%   { background-position: 0%   50%; }
      100% { background-position: 200% 50%; }
    }
    .sr-moving-border {
      background: linear-gradient(90deg, var(--clr-lime), var(--clr-mint), var(--clr-green), var(--clr-sage), var(--clr-lime));
      background-size: 300% 100%;
      animation: sr-border-spin 4s linear infinite;
    }

    /* Text shimmer */
    .sr-shimmer-text {
      background: linear-gradient(
        110deg,
        var(--clr-lime) 0%,
        var(--clr-mint) 35%,
        var(--clr-green) 55%,
        var(--clr-lime) 80%
      );
      background-size: 250% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: sr-shimmer-flow 5s ease-in-out infinite;
    }
    @keyframes sr-shimmer-flow {
      0%,100% { background-position: 0%   50%; }
      50%      { background-position: 100% 50%; }
    }

    /* Shimmer button sweep */
    .sr-shimmer-btn::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(
        105deg,
        transparent 35%,
        rgba(255,255,255,0.28) 50%,
        transparent 65%
      );
      background-size: 200% 100%;
      background-position: -100% 0;
      transition: background-position 0.55s ease;
    }
    .sr-shimmer-btn:hover::after { background-position: 120% 0; }

    /* Noise texture */
    .sr-noise::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0.025;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 180px 180px;
      mix-blend-mode: overlay;
    }

    /* Dot grid */
    .sr-dot-grid {
      background-image: radial-gradient(circle, rgba(62,250,72,0.10) 1px, transparent 1px);
      background-size: 22px 22px;
    }

    /* Dropdown item hover */
    .sr-sort-item:hover {
      background: rgba(62,250,72,0.07);
      color: var(--clr-lime) !important;
    }

    /* Loader spin ring */
    @keyframes sr-spin-ring {
      to { transform: rotate(360deg); }
    }
    .sr-spin { animation: sr-spin-ring 1s linear infinite; }

    /* Pulse ring for loader */
    @keyframes sr-pulse {
      0%   { transform: scale(1);   opacity: 0.5; }
      100% { transform: scale(1.7); opacity: 0;   }
    }
    .sr-pulse-ring { animation: sr-pulse 1.8s ease-out infinite; }

    /* Fade-up utility */
    @keyframes sr-fade-up {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .sr-fade-up {
      opacity: 0;
      animation: sr-fade-up 0.75s cubic-bezier(0.22,1,0.36,1) forwards;
    }
  `}</style>
);

const SearchResults: React.FC = () => {
  /* ── PRESERVED LOGIC ── */
  const [searchParams, setSearchParams] = useSearchParams();
  const [activities, setActivities]     = useState<any[]>([]);
  const [categories, setCategories]     = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showFilters, setShowFilters]   = useState(false);
  const [sortOpen, setSortOpen]         = useState(false);

  useEffect(() => {
    if (document.getElementById('agro-card-anim')) return;
    const tag = document.createElement('style');
    tag.id = 'agro-card-anim';
    tag.textContent = CARD_ANIMATION_CSS;
    document.head.appendChild(tag);
  }, []);

  const filters = {
    q:        searchParams.get('q')        || '',
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    rating:   searchParams.get('rating')   || '',
    sort:     searchParams.get('sort')     || 'relevance',
    lat:      searchParams.get('lat')      || '',
    lng:      searchParams.get('lng')      || '',
    radius:   searchParams.get('radius')   || '',
  };

  useEffect(() => {
    getCategories().then(res => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const apiParams: SearchParams = {
          q:        filters.q        || undefined,
          category: filters.category || undefined,
          priceMin: filters.priceMin ? Number(filters.priceMin) : undefined,
          priceMax: filters.priceMax ? Number(filters.priceMax) : undefined,
          rating:   filters.rating   ? Number(filters.rating)   : undefined,
          sort:     filters.sort,
          lat:      filters.lat      ? Number(filters.lat)      : undefined,
          lng:      filters.lng      ? Number(filters.lng)      : undefined,
          radius:   filters.radius   ? Number(filters.radius)   : undefined,
        };
        const res = await searchActivities(apiParams);
        setActivities(res.data.activities);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateFilter = (key: string, value: any) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set(key, value) : p.delete(key);
    setSearchParams(p);
  };

  const updateLocationFilter = (lat: number, lng: number, radius: number) => {
    const p = new URLSearchParams(searchParams);
    p.set('lat',    lat.toString());
    p.set('lng',    lng.toString());
    p.set('radius', radius.toString());
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});

  const SORT_OPTIONS = [
    { value: 'relevance',  label: 'Relevance' },
    { value: 'price_asc',  label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'rating',     label: 'Top Rated' },
    { value: 'newest',     label: 'Newest Added' },
  ];
  const activeSortLabel = SORT_OPTIONS.find(o => o.value === filters.sort)?.label ?? 'Relevance';

  /* ══════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════ */
  return (
    <>
      <PageStyles />

      <div
        className="sr-retro-grid relative flex flex-col md:flex-row min-h-screen overflow-hidden"
        style={{
          background: 'var(--clr-dark)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          color: '#f5f5f5',
        }}
      >

        {/* ── Atmospheric beam SVG ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.20 }}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="sg1" cx="70%" cy="10%" r="50%">
              <stop offset="0%" stopColor="#3EFA48" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#3EFA48" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sg2" cx="10%" cy="60%" r="45%">
              <stop offset="0%" stopColor="#1BFA99" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#1BFA99" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sg3" cx="90%" cy="90%" r="40%">
              <stop offset="0%" stopColor="#B5F720" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#B5F720" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#sg1)" />
          <rect width="100%" height="100%" fill="url(#sg2)" />
          <rect width="100%" height="100%" fill="url(#sg3)" />
          {[...Array(5)].map((_, i) => (
            <line
              key={i}
              x1={`${15 + i * 18}%`} y1="0%"
              x2={`${10 + i * 18}%`} y2="100%"
              stroke="#3EFA48"
              strokeWidth="0.4"
              strokeOpacity={0.03 + i * 0.007}
            />
          ))}
        </svg>

        {/* ── Dot grid overlay ── */}
        <div className="sr-dot-grid absolute inset-0 opacity-25 pointer-events-none" />

        {/* ══════════════════════════════════════════
            SIDEBAR (logic + props: unchanged)
            ══════════════════════════════════════════ */}
        <FilterSidebar
          filters={filters}
          categories={categories}
          onFilterChange={updateFilter}
          onLocationUpdate={updateLocationFilter}
          onClear={clearFilters}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
        />

        {/* ══════════════════════════════════════════
            MAIN CONTENT
            ══════════════════════════════════════════ */}
        <main className="relative z-10 flex-1 px-4 py-6 md:px-8 md:py-10 md:pl-6 max-w-7xl mx-auto w-full">

          {/* ─────────────────────────────────────────
              MOBILE TOP BAR
              ───────────────────────────────────────── */}
          <div className="md:hidden mb-5">
            <div
              className="sr-noise relative flex items-center justify-between rounded-[22px] px-5 py-4 overflow-hidden"
              style={{
                background: 'rgba(13,31,16,0.90)',
                border: '1px solid rgba(62,250,72,0.10)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.30)',
              }}
            >
              <div className="sr-moving-border absolute top-0 left-0 right-0" style={{ height: '1.5px', opacity: 0.7 }} />

              <div>
                <h2
                  className="font-bold text-white text-base leading-tight"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {filters.q ? `"${filters.q}"` : 'Explore'}
                </h2>
                <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {activities.length} experience{activities.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Mobile filter toggle — shimmer button */}
              <button
                onClick={() => setShowFilters(true)}
                className="sr-shimmer-btn relative flex items-center gap-2 text-[12px] font-bold overflow-hidden px-4 py-2.5 rounded-xl active:scale-95 transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, var(--clr-lime), var(--clr-mint))',
                  color: 'var(--clr-dark)',
                  boxShadow: '0 4px 16px rgba(181,247,32,0.30)',
                }}
              >
                <SlidersHorizontal size={13} strokeWidth={2} />
                Filters
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────
              DESKTOP TOP BAR
              ───────────────────────────────────────── */}
          <div
            className="sr-fade-up hidden md:flex items-end justify-between mb-10 pb-7"
            style={{
              borderBottom: '1px solid rgba(62,250,72,0.09)',
              animationDelay: '0ms',
              animationFillMode: 'forwards',
            }}
          >
            {/* Left: title block */}
            <div>
              {/* Eyebrow pill */}
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-4"
                style={{
                  background: 'rgba(62,250,72,0.10)',
                  color: 'var(--clr-lime)',
                  border: '1px solid rgba(62,250,72,0.20)',
                }}
              >
                <Sparkles size={11} strokeWidth={1.5} />
                Discover
              </span>

              <h1
                className="font-bold leading-tight tracking-tight"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '2.15rem',
                  color: 'rgba(255,255,255,0.92)',
                }}
              >
                {filters.q ? (
                  <>
                    Results for{' '}
                    <em className="sr-shimmer-text not-italic">{`"${filters.q}"`}</em>
                  </>
                ) : (
                  <>
                    Explore{' '}
                    <em className="sr-shimmer-text not-italic">All Experiences</em>
                  </>
                )}
              </h1>

              <p
                className="text-[13px] mt-2 font-light tracking-tight"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {loading ? (
                  'Searching…'
                ) : (
                  <>
                    <span className="font-bold" style={{ color: 'var(--clr-lime)' }}>
                      {activities.length}
                    </span>
                    {` activit${activities.length !== 1 ? 'ies' : 'y'} matching your criteria`}
                  </>
                )}
              </p>
            </div>

            {/* Right: sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(prev => !prev)}
                className="sr-noise relative flex items-center gap-3 rounded-2xl px-5 py-3 overflow-hidden transition-all duration-300"
                style={{
                  background: 'rgba(13,31,16,0.90)',
                  border: '1px solid rgba(62,250,72,0.12)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(181,247,32,0.28)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(0,0,0,0.35)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(62,250,72,0.12)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
                }}
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  Sort by
                </span>
                {/* Thin separator */}
                <span
                  className="w-px h-4 shrink-0"
                  style={{ background: 'rgba(255,255,255,0.10)' }}
                />
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: 'var(--clr-lime)' }}
                >
                  {activeSortLabel}
                </span>
                <ChevronDown
                  size={13}
                  strokeWidth={1.8}
                  style={{
                    color: 'rgba(255,255,255,0.35)',
                    transform: sortOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}
                />
              </button>

              {/* Sort dropdown panel */}
              {sortOpen && (
                <div
                  className="sr-noise absolute right-0 top-[calc(100%+8px)] w-60 rounded-[20px] py-2 z-30 overflow-hidden"
                  style={{
                    background: 'rgba(10,24,12,0.97)',
                    border: '1px solid rgba(62,250,72,0.13)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.50)',
                    backdropFilter: 'blur(24px)',
                  }}
                >
                  {/* Moving border on top of dropdown */}
                  <div
                    className="sr-moving-border absolute top-0 left-0 right-0"
                    style={{ height: '1px', opacity: 0.6 }}
                  />

                  {SORT_OPTIONS.map(opt => {
                    const isActive = filters.sort === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => { updateFilter('sort', opt.value); setSortOpen(false); }}
                        className="sr-sort-item w-full text-left px-5 py-2.5 text-[13px] font-medium flex items-center justify-between transition-all duration-200"
                        style={{
                          color: isActive ? 'var(--clr-lime)' : 'rgba(255,255,255,0.45)',
                          background: isActive ? 'rgba(181,247,32,0.07)' : 'transparent',
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                        }}
                      >
                        {opt.label}
                        {isActive && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: 'var(--clr-lime)', boxShadow: '0 0 6px var(--clr-lime)' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────
              LOADING STATE
              ───────────────────────────────────────── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-40">
              {/* Nested pulse rings */}
              <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                <span
                  className="sr-pulse-ring absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(181,247,32,0.40)' }}
                />
                <span
                  className="sr-pulse-ring absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(62,250,72,0.30)', animationDelay: '0.6s' }}
                />
                <div
                  className="relative w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(181,247,32,0.15), rgba(27,250,153,0.12))',
                    border: '1px solid rgba(181,247,32,0.25)',
                  }}
                >
                  <Loader2
                    className="sr-spin"
                    size={22}
                    strokeWidth={1.5}
                    style={{ color: 'var(--clr-lime)' }}
                  />
                </div>
              </div>

              <p
                className="text-[13px] font-light tracking-tight"
                style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Searching for the best experiences…
              </p>

              {/* Shimmer skeleton hint */}
              <div className="flex gap-3 mt-8">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-48 h-64 rounded-[22px]"
                    style={{
                      background: 'rgba(13,31,16,0.70)',
                      border: '1px solid rgba(62,250,72,0.07)',
                      animation: `cardReveal 0.5s ${i * 0.1}s ease forwards, sr-shimmer-skeleton 1.8s ${i * 0.2}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────
              RESULTS GRID — staggered reveal (unchanged)
              ───────────────────────────────────────── */}
          {!loading && activities.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {activities.map((activity, idx) => (
                <div
                  key={activity._id}
                  className="card-reveal"
                  style={{ animationDelay: `${idx * 0.06}s`, height: '420px' }}
                >
                  <ActivityCard activity={activity} />
                </div>
              ))}
            </div>
          )}

          {/* ─────────────────────────────────────────
              EMPTY STATE
              ───────────────────────────────────────── */}
          {!loading && activities.length === 0 && (
            <div
              className="sr-noise sr-fade-up relative flex flex-col items-center justify-center py-24 px-8 rounded-[32px] text-center overflow-hidden"
              style={{
                background: 'rgba(13,31,16,0.80)',
                border: '1px solid rgba(62,250,72,0.10)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.30)',
                animationDelay: '0ms',
                animationFillMode: 'forwards',
              }}
            >
              {/* Moving border on empty state card */}
              <div
                className="sr-moving-border absolute top-0 left-0 right-0"
                style={{ height: '1.5px', opacity: 0.60 }}
              />

              {/* Dot-grid watermark */}
              <div className="sr-dot-grid absolute inset-0 opacity-30 pointer-events-none rounded-[32px]" />

              {/* Ambient glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-[60px] pointer-events-none"
                style={{ background: 'rgba(62,250,72,0.05)' }}
              />

              {/* Icon vessel — pulsing ring */}
              <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                <span
                  className="sr-pulse-ring absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(62,250,72,0.25)' }}
                />
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(62,250,72,0.08)',
                    border: '1px solid rgba(62,250,72,0.16)',
                  }}
                >
                  <Search
                    size={26}
                    strokeWidth={1.4}
                    style={{ color: 'rgba(181,247,32,0.55)' }}
                  />
                </div>
              </div>

              <h3
                className="font-bold text-white text-2xl mb-3 tracking-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                No experiences found
              </h3>

              <p
                className="text-[14px] max-w-sm leading-relaxed mb-8 font-light"
                style={{ color: 'rgba(255,255,255,0.38)' }}
              >
                Nothing matches your current filters. Try broadening your search,
                adjusting the distance radius, or exploring a different category.
              </p>

              {/* Clear filters — shimmer button */}
              <button
                onClick={clearFilters}
                className="sr-shimmer-btn relative inline-flex items-center gap-2 text-[13px] font-bold overflow-hidden px-6 py-3 rounded-2xl active:scale-95 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, var(--clr-lime), var(--clr-mint))',
                  color: 'var(--clr-dark)',
                  boxShadow: '0 4px 20px rgba(181,247,32,0.28)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(181,247,32,0.45)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(181,247,32,0.28)';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                Clear all filters
              </button>
            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default SearchResults;