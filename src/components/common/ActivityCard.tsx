import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Heart, Clock, ArrowRight, Leaf } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { addFavorite, removeFavorite } from '../../services/userService';

interface ActivityCardProps {
  activity: any;
  isFavorite?: boolean;
}

/* ══════════════════════════════════════════════════════
   CARD-SCOPED STYLES — injected once per mount
   ══════════════════════════════════════════════════════ */
const CardStyles = () => (
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

    /* Moving border gradient */
    @keyframes card-border-spin {
      0%   { background-position: 0%   50%; }
      100% { background-position: 200% 50%; }
    }
    .card-moving-border {
      background: linear-gradient(
        90deg,
        var(--clr-lime), var(--clr-mint), var(--clr-green), var(--clr-sage), var(--clr-lime)
      );
      background-size: 300% 100%;
      animation: card-border-spin 4s linear infinite;
    }

    /* Shimmer sweep on the CTA arrow button */
    .card-shimmer-btn::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(
        105deg,
        transparent 35%,
        rgba(255,255,255,0.30) 50%,
        transparent 65%
      );
      background-size: 200% 100%;
      background-position: -100% 0;
      transition: background-position 0.55s ease;
    }
    .card-shimmer-btn:hover::after {
      background-position: 120% 0;
    }

    /* Text shimmer — price accent */
    .card-price-shimmer {
      background: linear-gradient(
        110deg,
        var(--clr-lime) 0%,
        var(--clr-mint) 40%,
        var(--clr-green) 55%,
        var(--clr-lime) 100%
      );
      background-size: 250% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: price-shimmer 5s ease-in-out infinite;
    }
    @keyframes price-shimmer {
      0%,100% { background-position: 0%   50%; }
      50%      { background-position: 100% 50%; }
    }

    /* Noise texture overlay */
    .card-noise::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0.028;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 160px 160px;
      mix-blend-mode: overlay;
    }

    /* Dot-grid watermark inside card body */
    .card-dot-grid {
      background-image: radial-gradient(
        circle,
        rgba(62,250,72,0.09) 1px,
        transparent 1px
      );
      background-size: 18px 18px;
    }

    /* Leaf float */
    @keyframes card-leaf-float {
      0%,100% { transform: translateY(0)    rotate(-5deg); }
      50%      { transform: translateY(-6px) rotate(5deg);  }
    }

    /* Pulse ring on rating star */
    @keyframes card-pulse-ring {
      0%   { transform: scale(1);   opacity: 0.55; }
      100% { transform: scale(1.8); opacity: 0;    }
    }

    /* Favourite heart beat */
    @keyframes card-heart-beat {
      0%,100% { transform: scale(1);    }
      30%      { transform: scale(1.35); }
      60%      { transform: scale(0.9);  }
    }
    .card-heart-active {
      animation: card-heart-beat 0.45s ease-out forwards;
    }

    /* Card hover lift */
    .agro-card {
      transition: transform 0.7s cubic-bezier(0.23,1,0.32,1),
                  box-shadow 0.7s cubic-bezier(0.23,1,0.32,1);
    }
    .agro-card:hover {
      transform: scale(1.025) translateY(-5px);
      box-shadow:
        0 28px 70px rgba(0,0,0,0.32),
        0  0  0 1px rgba(181,247,32,0.14),
        0  0 40px rgba(62,250,72,0.07) inset;
    }
  `}</style>
);

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isFavorite: initialFav }) => {
  /* ── PRESERVED LOGIC ── */
  const [isFavorite, setIsFavorite] = useState(initialFav || false);
  const { isAuthenticated } = useContext(AuthContext);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login to save favorites');
      return;
    }
    try {
      if (isFavorite) {
        await removeFavorite(activity._id);
        setIsFavorite(false);
      } else {
        await addFavorite(activity._id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/600x400';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const imageUrl = getImageUrl(activity.images?.[0]?.url);

  /* ── render ── */
  return (
    <>
      <CardStyles />

      <Link
        to={`/activities/${activity._id}`}
        className="block group h-full focus:outline-none"
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        {/*
          ╔══════════════════════════════════════════════════════╗
          ║  AGRO-LUXURY DARK CARD                               ║
          ║  Aesthetic: Dark-forest glass × Neon-organic        ║
          ║  Palette:   #0d1f10 surface · lime/mint accents     ║
          ╚══════════════════════════════════════════════════════╝
        */}
        <article
          className="agro-card card-noise relative h-full flex flex-col rounded-[28px] overflow-hidden"
          style={{
            background: 'rgba(13,31,16,0.92)',
            border: '1px solid rgba(62,250,72,0.09)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.30), 0 0 0 0.5px rgba(62,250,72,0.06)',
          }}
        >

          {/* ── Moving border top-edge ── */}
          <div
            className="card-moving-border absolute top-0 left-0 right-0 z-20"
            style={{ height: '1.5px', opacity: 0.75 }}
          />

          {/* ── Ambient glow — top-right ── */}
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[80px] pointer-events-none z-0"
            style={{ background: 'rgba(181,247,32,0.06)' }}
          />

          {/* ════════════════════════════
              IMAGE ZONE
              ════════════════════════════ */}
          <div className="relative h-52 shrink-0 overflow-hidden">

            {/* Photo */}
            <img
              src={imageUrl}
              alt={activity.customTitle}
              className="w-full h-full object-cover transition-transform duration-700 ease-out"
              style={{ transform: 'scale(1.04)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.10)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; }}
            />

            {/* Dark vignette gradients */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(5,15,7,0.82) 0%, rgba(5,15,7,0.18) 55%, transparent 100%)' }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(5,15,7,0.30) 0%, transparent 40%)' }}
            />

            {/* Retro-grid overlay on image — very subtle */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(62,250,72,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(62,250,72,0.03) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            {/* ── Category badge — top-left ── */}
            <div className="absolute top-3.5 left-3.5 z-10">
              <span
                className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(5,15,7,0.72)',
                  color: 'var(--clr-lime)',
                  border: '1px solid rgba(181,247,32,0.22)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Leaf
                  size={9}
                  strokeWidth={1.5}
                  style={{ color: 'var(--clr-mint)', animation: 'card-leaf-float 4s ease-in-out infinite' }}
                />
                {activity.categoryData?.categoryName || 'Experience'}
              </span>
            </div>

            {/* ── Favourite button — top-right ── */}
            <button
              onClick={toggleFavorite}
              aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              className="group/fav absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90"
              style={{
                background: 'rgba(13,31,16,0.75)',
                border: `1px solid ${isFavorite ? 'rgba(255,80,80,0.40)' : 'rgba(255,255,255,0.12)'}`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <Heart
                size={15}
                strokeWidth={1.4}
                className={isFavorite ? 'card-heart-active' : ''}
                style={{
                  fill: isFavorite ? '#E53E3E' : 'transparent',
                  color: isFavorite ? '#E53E3E' : 'rgba(255,255,255,0.50)',
                  transition: 'all 0.3s ease',
                }}
              />
            </button>

            {/* ── Rating pill — bleeds onto content section ── */}
            <div
              className="absolute -bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: 'rgba(13,31,16,0.95)',
                border: '1px solid rgba(181,247,32,0.18)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.30)',
              }}
            >
              {/* Pulse ring behind star */}
              <div className="relative flex items-center justify-center">
                <Star
                  size={11}
                  strokeWidth={1.2}
                  style={{ fill: 'var(--clr-lime)', color: 'var(--clr-lime)', position: 'relative', zIndex: 1 }}
                />
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '1px solid var(--clr-lime)',
                    animation: 'card-pulse-ring 2.8s ease-out infinite',
                  }}
                />
              </div>
              <span
                className="text-[12px] font-bold tabular-nums leading-none"
                style={{ color: 'var(--clr-lime)', fontFamily: 'Playfair Display, serif' }}
              >
                {activity.averageRating ? activity.averageRating.toFixed(1) : 'New'}
              </span>
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                ({activity.reviewCount || 0})
              </span>
            </div>
          </div>


          {/* ════════════════════════════
              CONTENT ZONE
              ════════════════════════════ */}
          <div className="relative flex flex-col flex-1 px-5 pt-7 pb-5 z-10">

            {/* Dot-grid watermark — very subtle */}
            <div className="card-dot-grid absolute inset-0 rounded-b-[28px] opacity-40 pointer-events-none" />

            {/* Ambient bottom glow */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 rounded-b-[28px] pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(62,250,72,0.03), transparent)' }}
            />

            {/* Location row */}
            <div className="relative z-10 flex items-center gap-1.5 mb-3">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ background: 'rgba(62,250,72,0.10)', border: '1px solid rgba(62,250,72,0.16)' }}
              >
                <MapPin size={10} strokeWidth={1.5} style={{ color: 'var(--clr-mint)' }} />
              </div>
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.18em] truncate"
                style={{ color: 'rgba(255,255,255,0.38)' }}
              >
                {activity.farm?.location?.city || 'Sri Lanka'}
              </span>
            </div>

            {/* Title */}
            <h3
              className="relative z-10 text-[17px] font-bold leading-[1.35] line-clamp-2 mb-auto transition-colors duration-400"
              style={{
                fontFamily: 'Playfair Display, serif',
                color: 'rgba(255,255,255,0.92)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--clr-lime)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.92)'; }}
            >
              {activity.customTitle}
            </h3>

            {/* Divider with centre leaf */}
            <div className="relative my-4 z-10">
              <div
                className="h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(62,250,72,0.18), transparent)' }}
              />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(13,31,16,0.95)', border: '1px solid rgba(62,250,72,0.14)' }}
              >
                <Leaf
                  size={9}
                  strokeWidth={1.2}
                  style={{ color: 'var(--clr-mint)', opacity: 0.65, animation: 'card-leaf-float 5s ease-in-out 0.5s infinite' }}
                />
              </div>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between z-10">

              {/* Duration */}
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(27,250,153,0.08)', border: '1px solid rgba(27,250,153,0.14)' }}
                >
                  <Clock size={12} strokeWidth={1.4} style={{ color: 'var(--clr-mint)' }} />
                </div>
                <span
                  className="text-[11px] font-semibold tracking-wide"
                  style={{ color: 'rgba(255,255,255,0.40)' }}
                >
                  {activity.durationHours} hrs
                </span>
              </div>

              {/* Price + CTA cluster */}
              <div className="flex items-center gap-3">

                {/* Price block */}
                <div className="text-right leading-none">
                  <div className="flex items-baseline gap-0.5">
                    <span
                      className="text-[8px] font-bold uppercase tracking-wider"
                      style={{ color: 'rgba(255,255,255,0.30)' }}
                    >
                      LKR
                    </span>
                    <span
                      className="card-price-shimmer text-[15px] font-bold tabular-nums"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {activity.pricePerPerson.toLocaleString()}
                    </span>
                  </div>
                  <span
                    className="text-[8px] font-medium uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                  >
                    per person
                  </span>
                </div>

                {/* Arrow CTA — shimmer button */}
                <div
                  className="card-shimmer-btn relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden cursor-pointer transition-all duration-400"
                  style={{
                    background: 'linear-gradient(135deg, var(--clr-lime), var(--clr-mint))',
                    boxShadow: '0 4px 16px rgba(181,247,32,0.28)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 6px 24px rgba(181,247,32,0.50)';
                    el.style.transform = 'scale(1.10)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 4px 16px rgba(181,247,32,0.28)';
                    el.style.transform = 'none';
                  }}
                >
                  <ArrowRight
                    size={14}
                    strokeWidth={2}
                    style={{ color: 'var(--clr-dark)', position: 'relative', zIndex: 1, transition: 'transform 0.3s ease' }}
                  />
                </div>

              </div>
            </div>
          </div>

        </article>
      </Link>
    </>
  );
};

export default ActivityCard;